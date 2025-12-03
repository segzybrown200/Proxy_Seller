import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LineChart } from "react-native-chart-kit";
import { useDashboardStats, useVendors } from "hooks/useHooks";
import * as Location from 'expo-location';
import { vendorAddress } from "api/api";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
import { router } from "expo-router";

const screenWidth = Dimensions.get("window").width;

const SellerDashboard = () => {
  const user: any = useSelector(selectUser);
  const token = user?.token || "";
  const vendorId = user?.user?.vendorApplicationId || "";
  const {
    isLoading: userIsLoading,
    profile,
    isError: userIsError,
    mutate: mutateVendor,
  } = useVendors(vendorId, token);
  const {
    isLoading,
    dashboard,
    isError,
  } = useDashboardStats(token);

  const stats = dashboard?.data || {
    runningOrders: 0,
    orderRequests: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    todayNewOrders: 0,
    monthlyRevenue: { labels: [], values: [] },
    popularListings: [],
  };

  const months = stats?.monthlyRevenue?.labels || [];
  const earnings = stats?.monthlyRevenue?.values || [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof mutateVendor === 'function') {
        await mutateVendor();
      } else {
        // fallback short delay
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (e) {
      console.warn('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [mutateVendor]);

  // Use refs to track last known location and last update timestamp so we don't
  // retrigger hooks or re-subscribe the watcher when these values change.
  const lastLocationRef = React.useRef<null | { latitude: number; longitude: number }>(null);
  const lastUpdateRef = React.useRef<number>(0);

  // Haversine distance in meters
  const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371e3; // metres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  React.useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
          return;
        }

        // initialize lastLocationRef from profile if available

        const prevLat = profile?.data?.location?.lat;
        const prevLng = profile?.data?.location?.lng;
        if (prevLat != null && prevLng != null && !lastLocationRef.current) {
          lastLocationRef.current = { latitude: Number(prevLat), longitude: Number(prevLng) };
        }

        // Start watcher once. Use balanced accuracy and larger intervals to
        // reduce battery and CPU usage. We'll still check distance and only
        // send a network update when moved >= 1000m and when cooldown passed.
        subscriber = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 120000, // 2 minutes
            distanceInterval: 50, // 100 meters
          },
          async (loc) => {
            try {
              const { latitude, longitude } = loc.coords;

              const prev = lastLocationRef.current || (profile?.data?.location ? { latitude: Number(profile.data.location.lat), longitude: Number(profile.data.location.lng) } : null);
              if (!prev) {
                // No previous location recorded, set and skip update
                lastLocationRef.current = { latitude, longitude };
                return;
              }

              const meters = distanceMeters(prev.latitude, prev.longitude, latitude, longitude);

              // cooldown: avoid updating backend too frequently (e.g., once every 5 minutes)
              const now = Date.now();
              const cooldown = 1 * 60 * 1000; // 1 minute for testing
              const distanceThreshold = 50; // 50 meters for testing (was 100)
              
              if (meters >= distanceThreshold && (now - lastUpdateRef.current > cooldown)) {
                console.log(`✅ Vendor moved ${Math.round(meters)}m, updating location`);

                let address = '';
                let city = '';
                let country = '';

                try {
                  // attempt reverse geocoding to get a fresh human-readable address
                  const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
                  console.log('Reverse geocode result:', rev);
                  
                  if (rev && rev.length > 0) {
                    const r = rev[0];
                    // Build a complete address from reverse geocode
                    address = [r.name, r.street, r.city, r.region, r.postalCode, r.country].filter(Boolean).join(', ');
                    city = r.city || '';
                    country = r.country || '';
                    console.log('New address from geocode:', address);
                  }
                } catch (e) {
                  // non-fatal: if geocode fails, use lat/lng as address
                  console.warn('reverse geocode failed', e);
                  address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }

                // Ensure we have at least some address
                if (!address) {
                  address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }

                const payload = {
                  address,
                  lat: latitude,
                  lng: longitude,
                  city,
                  country,
                  userId: vendorId,
                };

                console.log('Sending payload:', payload);
                try {
                  await vendorAddress(payload);
                  console.log('Location updated successfully');
                  // refresh vendor profile so UI reflects new location
                  try { mutateVendor?.(); } catch (e) { /* ignore */ }
                  lastLocationRef.current = { latitude, longitude };
                  lastUpdateRef.current = Date.now();
                } catch (err) {
                  console.warn('Failed to update vendor location', err);
                }
              }
            } catch (err) {
              console.warn('Error handling location update', err);
            }
          }
        );
      } catch (err) {
        console.warn('Failed to start location watcher', err);
      }
    };

    startWatching();

    return () => {
      if (subscriber) subscriber.remove();
    };
    // run once on mount; profile may update separately and we set initial ref above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (isLoading || userIsLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004CFF" />
        <Text className="mt-3 font-NunitoMedium text-gray-500">
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError || userIsError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 font-NunitoSemiBold">
          Failed to load stats
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB] p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-10">
        <TouchableOpacity onPress={()=>router.push("/(tabs)/(profile)")} className="bg-white shadow-sm w-[15%] p-4 rounded-full">
          <FontAwesome6 name="bars" size={22} color="#004CFF" />
        </TouchableOpacity>

        <View className="flex flex-col justify-between flex-1 items-center">
          <Text className="text-xl font-RalewayBold text-[#004CFF]">
            Dashboard
          </Text>
          <Text
            className="font-NunitoRegular text-base  text-center"
            numberOfLines={3}
          >
            {profile?.data?.location?.Address || "Vendor Address"}
          </Text>
        </View>

        {profile?.data?.user?.kycDocument ? (
          <Image
            source={{ uri: profile.data.user.kycDocument.selfieUrl }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("../../../assets/images/artist-2 2.png")}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Row */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-5xl font-RalewayExtraBold text-gray-900">
              {stats.todayNewOrders}
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              New Orders Today
            </Text>
          </View>

          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-3xl font-RalewayExtraBold text-gray-900">
              ₦{stats.todayRevenue.toLocaleString()}
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              Today’s Revenue
            </Text>
          </View>
        </View>

        {/* Order Overview */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-5xl font-RalewayExtraBold text-gray-900">
              {stats.runningOrders}
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              Running Orders
            </Text>
          </View>

          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-5xl font-RalewayExtraBold text-gray-900">
              {stats.orderRequests}
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              Pending Requests
            </Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="bg-white p-5 rounded-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-base font-RalewaySemiBold text-gray-500">
                Total Revenue
              </Text>
              <Text className="text-3xl font-RalewayExtraBold text-gray-900">
                ₦{stats.totalRevenue.toLocaleString()}
              </Text>
            </View>
          </View>

          {months.length > 0 ? (
            <LineChart
              data={{
                labels: months,
                datasets: [{ data: earnings.map(Number) }],
              }}
              width={screenWidth - 70}
              height={180}
              yAxisLabel="₦"
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 76, 255, ${opacity})`,
                labelColor: () => "#004CFF",
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#004CFF",
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <Text className="text-center text-gray-400 font-NunitoMedium mt-4">
              No earnings data yet.
            </Text>
          )}
        </View>

        {/* Popular Listings */}
        <View className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-NunitoSemiBold text-gray-700">
              Popular Listings
            </Text>
          </View>

          {stats.popularListings?.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {stats.popularListings.map((item: any) => (
                <View key={item.id} className="mr-4 w-36 mb-32 items-center">
                  <Image
                    source={{ uri: item.image }}
                    className="w-36 h-36 rounded-2xl"
                    resizeMode="cover"
                  />
                  <Text
                    numberOfLines={1}
                    className="mt-2 text-center font-NunitoMedium text-gray-700"
                  >
                    {item.title}
                  </Text>
                  <Text className="text-[#004CFF] font-NunitoSemiBold">
                    {item.totalSold} sold
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-center text-gray-400 font-NunitoMedium">
              No popular listings yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerDashboard;
