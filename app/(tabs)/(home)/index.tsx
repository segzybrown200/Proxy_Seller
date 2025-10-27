import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LineChart } from "react-native-chart-kit";
import { useDashboardStats, useVendors } from "hooks/useHooks";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";

const screenWidth = Dimensions.get("window").width;

const SellerDashboard = () => {
  const user: any = useSelector(selectUser);
  const token = user?.token || "";
  const vendorId = user?.user?.vendorApplicationId || "";
  const { isLoading, dashboard, isError } = useDashboardStats(token);
  const { isLoading:userIsloading, profile, isError:userIsError } = useVendors(vendorId, token);


  const stats = dashboard?.data || {
    runningOrders: 0,
    orderRequests: 0,
    totalRevenue: 0,
    monthlyStats: {},
    popularListings: [],
  };

 const monthlyStats = stats?.monthlyStats || {};
const months = Object.keys(monthlyStats);
const earnings = Object.values(monthlyStats);


// console.log(JSON.stringify(profile.data?.kycDocument.selfieUrl ,null,2))
  if (isLoading || userIsloading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004CFF" />
        <Text className="mt-3 font-NunitoMedium text-gray-500">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  if (isError || userIsError) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 font-NunitoSemiBold">Failed to load stats</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB] p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-10">
        <TouchableOpacity className="bg-white shadow-sm p-4 rounded-full">
          <FontAwesome6 name="bars" size={22} color="#004CFF" />
        </TouchableOpacity>
        <View className="flex flex-col items-center">
        <Text className="text-xl font-RalewayBold text-[#004CFF]">Dashboard</Text>
        <Text className="font-NunitoRegular text-base w-[90%] text-center" numberOfLines={2}>{profile.data?.location.Address}</Text>

        </View>

        {
          profile.data?.user.kycDocument  ? (
            <Image
            source={{ uri: profile.data?.user.kycDocument.selfieUrl }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />)
          : (
              <Image
          source={require("../../../assets/images/artist-2 2.png")}
          className="w-12 h-12 rounded-full"
          resizeMode="cover"
        />
          )
        }
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
        {/* Order Stats */}
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
              Order Requests
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

          {stats.popularListings.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {stats.popularListings.map((item: any) => (
                <View key={item.id} className="mr-4 w-36 items-center">
                  <Image
                    source={{ uri: item.media[0]?.url }}
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
                    ₦{item.totalSales.toLocaleString()}
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
