import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Animated,
  Modal,
  TextInput,

} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
// import { pushOrderRider } from "api/api";\
import { Image } from "expo-image";
import { showError } from "utils/toast";
import axios from "axios"
import { mutate } from "swr";
import { vendorStartDelivery, completeSelfDelivery } from "api/api";
import * as Location from "expo-location";

const socket = io("https://proxy-backend-6of2.onrender.com");

const VendorPushToRidersScreen = () => {
  const { order } = useLocalSearchParams();
  const parsedOrder = JSON.parse(order as string);
  const user: any = useSelector(selectUser);
  const token = user?.token || "";
  const delivery = parsedOrder.delivery;



  const mapRef = useRef<MapView>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [riderAssigned, setRiderAssigned] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(delivery?.status || "PENDING");
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const riderAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Self-delivery states
  const [vendorLocation, setVendorLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isStartingDelivery, setIsStartingDelivery] = useState(false);
  const [isCompletingDelivery, setIsCompletingDelivery] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [deliveryStarted, setDeliveryStarted] = useState(delivery?.status === "IN_TRANSIT");
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    if (!delivery?.id) return;

    // ✅ Listen for assigned rider
    socket.on("rider_assigned", (data) => {
      if (data.deliveryId === delivery.id) {
        setRiderAssigned(data.rider);
        setIsSearching(false);
        Alert.alert(
          "Rider Assigned",
          `${data.rider.name || "A rider"} accepted this order`
        );
      }
    });

    return () => {
      socket.off("rider_assigned");
    };
  }, [delivery]);

  // Request location permission and get initial location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          setLocationPermissionGranted(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setVendorLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          showError("Location permission is required for self-delivery");
        }
      } catch (error) {
        console.error("Location permission error:", error);
      }
    };

    requestLocationPermission();
  }, []);

   useEffect(() => {
    if (!delivery?.id) return;

    socket.on("delivery_location_update", (data) => {
      if (data?.deliveryId === delivery.id) {
        const newLocation = { latitude: data.lat, longitude: data.lng };
        console.log(newLocation)
        setRiderLocation(newLocation);
        Animated.timing(riderAnim, {
          toValue: { x: data.lat, y: data.lng },
          duration: 800,
          useNativeDriver: false,
        }).start();
      }
    });

    socket.on("delivery_status_update", (data) => {
      if (data?.deliveryId === delivery.id) {
        setCurrentStatus(data.status);
      }
    });

    // socket.on("rider_assigned", (data) => {
    //   if (data?.deliveryId === delivery.id) {
    //     setRiderInfo(data.rider);
    //   }
    // });

    return () => {
      socket.off("delivery_location_update");
      socket.off("delivery_status_update");
      socket.off("rider_assigned");
    };
  }, [delivery]);

  const handlePushToRiders = async () => {
    setIsPushing(true);
    setIsSearching(true);
    try{
    const res = await axios.post(`https://proxy-backend-6of2.onrender.com/api/vendor/push-order-to-rider/${delivery.id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    mutate('/vendor/orders', async (data:any) => {
      const updatedOrders = data.data.map((order:any) => {
        if (order.id === parsedOrder.id) {
          return {
            ...order,
            delivery: {
              ...order.delivery,
              status: 'SEARCH_OF_RIDER'
            }
          };
        }
        return order;
      });
      return { ...data, data: updatedOrders };
    });
    console.log("Response:", res.data);
    Alert.alert(
      "Searching for riders...",
      `Sent to ${res.data.data.ridersFound} nearby riders`
    );
    setIsPushing(false);

    }catch(err){
      showError("Failed to push to riders");
      setIsSearching(false);
      setIsPushing(false);
    }
  };

  // Handle vendor starting self-delivery
  const handleStartSelfDelivery = async () => {
    if (!vendorLocation) {
      showError("Unable to get your current location");
      return;
    }

    setIsStartingDelivery(true);
    try {
      const response = await vendorStartDelivery(
        {
          deliveryId: delivery.id,
          currentLat: vendorLocation.latitude,
          currentLng: vendorLocation.longitude,
        },
        token
      );

      setDeliveryStarted(true);
      setCurrentStatus("IN_TRANSIT");
      
      Alert.alert("Success", "You have started the delivery");

      // Update local order state
      mutate('/vendor/orders', async (data: any) => {
        const updatedOrders = data.data.map((order: any) => {
          if (order.id === parsedOrder.id) {
            return {
              ...order,
              delivery: {
                ...order.delivery,
                status: 'IN_TRANSIT',
                vendorLat: vendorLocation.latitude,
                vendorLng: vendorLocation.longitude,
              }
            };
          }
          return order;
        });
        return { ...data, data: updatedOrders };
      });
    } catch (error: any) {
      showError(error?.message || "Failed to start delivery");
    } finally {
      setIsStartingDelivery(false);
    }
  };

  // Handle vendor completing self-delivery
  const handleCompleteSelfDelivery = async () => {
    setIsCompletingDelivery(true);
    try {
      const response = await completeSelfDelivery(
        {
          deliveryId: delivery.id,
          otp: otpInput || undefined,
        },
        token
      );

      setCurrentStatus("DELIVERED");
      setShowOTPModal(false);
      setOtpInput("");

      Alert.alert("Success", "Delivery completed and funds released");

      // Update local order state
      mutate('/vendor/orders', async (data: any) => {
        const updatedOrders = data.data.map((order: any) => {
          if (order.id === parsedOrder.id) {
            return {
              ...order,
              delivery: {
                ...order.delivery,
                status: 'DELIVERED',
              },
              order: {
                ...order.order,
                status: 'DELIVERED',
                serviceStatus: 'COMPLETED',
              }
            };
          }
          return order;
        });
        return { ...data, data: updatedOrders };
      });
    } catch (error: any) {
      showError(error?.message || "Failed to complete delivery");
    } finally {
      setIsCompletingDelivery(false);
    }
  };

  // Safely parse coordinates with fallback values
  const parseCoord = (value: any, fallback: number = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  const pickup = {
    latitude: parseCoord(delivery.pickupLat, 6.5244),
    longitude: parseCoord(delivery.pickupLng, 3.3792),
  };
  const dropoff = {
    latitude: parseCoord(delivery.dropoffLat, 6.5244),
    longitude: parseCoord(delivery.dropoffLng, 3.3792),
  };
    const riderCords = {
    latitude: Number(parsedOrder.delivery?.rider?.currentLat) || 0,
    longitude: Number(parsedOrder.delivery?.rider?.currentLng) || 0,
  }
  console.log(delivery);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Push Order</Text>
      </View>

      {/* Map */}
      <View className="flex-1" >
        {pickup.latitude === 0 || pickup.longitude === 0 ? (
          <View className="flex-1 justify-center items-center bg-gray-100">
            <Text className="text-gray-500 font-NunitoMedium">
              Invalid coordinates. Map cannot be displayed.
            </Text>
          </View>
        ) : (
          <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={pickup} title="Pickup" pinColor="blue" />
          <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />
           {riderLocation && (
            <Marker coordinate={riderLocation } title="Rider" pinColor="red" />
          )}
          <Polyline
            coordinates={[
              pickup,
              ...(riderLocation ? [riderLocation] : []),
              dropoff,
            ]}
            strokeColor="#004CFF"
            strokeWidth={4}
          />
        </MapView>
          </View>
        )}

        {/* Scrollable Order Details and Delivery Info */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Order details */}
          <View className="w-full">
            <View className="bg-white p-5 rounded-t-3xl border-t border-gray-300">
              <Text className="text-lg font-NunitoBold text-black mb-2">
                Order Details
              </Text>
              <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
             {
                parsedOrder.listings.map((listing:any) => (
                  <View key={listing.id} className="mb-2 mx-2 items-center">
                    <Image
                      source={{
                        uri: listing.image ||
                          "https://via.placeholder.com/100",
                      }}
                      className="w-16 h-16 rounded-md mr-3 mb-1"
                      contentFit="cover"
                      style={{ width: 64, height: 64, borderRadius: 8 }}
                    />
                    <Text className="text-primary-100 font-NunitoMedium">
                      {listing.title} x {listing.quantity}
                    </Text>
                  </View>
                ))
             }
              </ScrollView>

              <Text className="text-gray-800 text-xl font-NunitoBold">
                Total: ₦{parsedOrder?.transaction?.amountPaid.toLocaleString()}
              </Text>
          </View>
          </View>

          {/* Order Info */}
          <View className="bg-white p-5 rounded-t-3xl border-t border-gray-300">
            <Text className="text-lg font-NunitoBold text-black mb-2">
              Delivery Summary
            </Text>

            <Text className="text-primary-100 font-NunitoMedium">
              Pickup: {delivery.pickupAddress}
            </Text>
            <Text className="text-primary-100 font-NunitoMedium mt-1">
              Dropoff: {delivery.dropoffAddress}
            </Text>

            <Text className="text-gray-800 text-xl font-NunitoBold mt-3">
              Fare: ₦{delivery.fareAmount.toLocaleString()}
            </Text>

            <View className="mt-5">
              {riderAssigned || parsedOrder?.rider ? (
                 <View className="flex-row items-center mb-6 mt-2">
                <Image
                  source={{
                    uri:
                      parsedOrder?.rider?.kyc?.selfieUrl ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                  contentFit="cover"
                  style={{ borderRadius: 100, width: 48, height: 48, marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text className="font-NunitoBold text-black text-lg">
                    {parsedOrder?.rider?.name}
                  </Text>
                  <Text className="font-NunitoMedium text-gray-500">
                    {parsedOrder?.rider?.vehicleType || "Bike"}
                  </Text>
                  <View className="flex flex-row gap-3">
                     <Text className="font-NunitoMedium text-gray-500">
                    {parsedOrder?.rider?.vehicle?.model}
                  </Text>
                     <Text className="font-NunitoMedium text-gray-500">
                    PlateNumber: {parsedOrder?.rider?.vehicle?.plateNumber}
                  </Text>
                  </View>
                 
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${parsedOrder.rider?.phone}`)}
                  className="bg-primary-100 px-3 py-3 rounded-full"
                >
                  <Ionicons name="call-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              ) : parsedOrder.delivery.status === "SEARCH_OF_RIDER" ? 
              <View>
                <Text className="text-primary-100 font-NunitoMedium">
                  Order is currently being searched by riders so hold on so a rider can accept...
                </Text>
              </View>
              : deliveryStarted ? (
                <View className="mt-4 gap-3">
                  {currentStatus === "IN_TRANSIT" && (
                    <TouchableOpacity
                      disabled={isCompletingDelivery}
                      onPress={() => setShowOTPModal(true)}
                      className={`py-3 rounded-full ${
                        isCompletingDelivery
                          ? "bg-gray-400"
                          : "bg-green-600"
                      }`}
                    >
                      {isCompletingDelivery ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white text-center font-NunitoBold text-lg">
                          Complete Delivery
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {currentStatus === "DELIVERED" && (
                    <View className="py-3 rounded-full bg-green-100 border border-green-600">
                      <Text className="text-green-600 text-center font-NunitoBold text-lg">
                        ✓ Delivery Completed
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="mt-4 gap-3">
                  <TouchableOpacity
                    disabled={isPushing || isSearching}
                    onPress={handlePushToRiders}
                    className={`py-3 rounded-full ${
                      isSearching
                        ? "bg-yellow-500"
                        : isPushing
                          ? "bg-gray-400"
                          : "bg-[#004CFF]"
                    }`}
                  >
                    {isPushing || isSearching ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-NunitoBold text-lg">
                        Push to Nearby Riders
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={isStartingDelivery || !locationPermissionGranted}
                    onPress={handleStartSelfDelivery}
                    className={`py-3 rounded-full ${
                      isStartingDelivery
                        ? "bg-gray-400"
                        : !locationPermissionGranted
                        ? "bg-gray-300"
                        : "bg-green-600"
                    }`}
                  >
                    {isStartingDelivery ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center font-NunitoBold text-lg">
                        {locationPermissionGranted ? "Start Self Delivery" : "Enable Location to Self Deliver"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* OTP Modal for completing delivery */}
      <Modal
        visible={showOTPModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOTPModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 pb-8">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-2xl font-NunitoBold">Complete Delivery</Text>
              <TouchableOpacity onPress={() => setShowOTPModal(false)}>
                <Ionicons name="close" size={28} color="black" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 font-NunitoMedium mb-4">
              Enter the OTP provided by the customer (if required):
            </Text>

            <TextInput
              placeholder="Enter OTP (Optional)"
              placeholderTextColor="#999"
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="number-pad"
              maxLength={6}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 font-NunitoMedium text-lg"
            />

            <TouchableOpacity
              disabled={isCompletingDelivery}
              onPress={handleCompleteSelfDelivery}
              className={`py-3 rounded-full ${
                isCompletingDelivery
                  ? "bg-gray-400"
                  : "bg-green-600"
              }`}
            >
              {isCompletingDelivery ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-NunitoBold text-lg">
                  Confirm Delivery
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isCompletingDelivery}
              onPress={() => setShowOTPModal(false)}
              className="mt-3 py-3 rounded-full bg-gray-200"
            >
              <Text className="text-gray-700 text-center font-NunitoBold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VendorPushToRidersScreen;
