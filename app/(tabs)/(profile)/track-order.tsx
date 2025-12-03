import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import Ionicons from "react-native-vector-icons/Ionicons";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
// import { pushOrderRider } from "api/api";
import { showError } from "utils/toast";
import axios from "axios"
import { mutate } from "swr";

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

  console.log(parsedOrder)

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


    // pushOrderRider(delivery.id, token)
    //   .then((res) => {
    //     Alert.alert(
    //       "Searching for riders...",
    //       `Sent to ${res.data.data.ridersFound} nearby riders`
    //     );
    //   })
    //   .catch((err) => {
    //     showError(err.message || "Failed to push to riders");
    //     setIsSearching(false);
    //   })
    //   .finally(() => {
    //     setIsPushing(false);
    //   });
  };

  const pickup = {
    latitude: Number(delivery.pickupLat),
    longitude: Number(delivery.pickupLng),
  };
  const dropoff = {
    latitude: Number(delivery.dropoffLat),
    longitude: Number(delivery.dropoffLng),
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
      <View className="flex-1">
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={{
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={pickup} title="Pickup" pinColor="blue" />
          <Marker coordinate={dropoff} title="Dropoff" pinColor="green" />
        </MapView>

        {/* Order details */}
        <View className="absolute bottom-0 w-full">
          <View className="bg-white p-5 rounded-t-3xl border-t border-gray-300">
            <Text className="text-lg font-NunitoBold text-black mb-2">
              Order Details
            </Text>
            <View className="mb-4">
           {
              parsedOrder.listings.map((listing:any) => (
                <View key={listing.id} className="mb-2">
                  <Image
                    source={{
                      uri: listing.image ||
                        "https://via.placeholder.com/100",
                    }}
                    className="w-16 h-16 rounded-md mr-3 mb-1"
                  />
                  <Text className="text-primary-100 font-NunitoMedium">
                    {listing.title} x {listing.quantity}
                  </Text>
                </View>
              ))
           }
            </View>

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
            {riderAssigned ? (
              <View className="flex-row items-center">
                <Image
                  source={{
                    uri:
                      riderAssigned.photo ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View>
                  <Text className="text-black font-NunitoBold">
                    {riderAssigned.name}
                  </Text>
                  <Text className="text-gray-500 font-NunitoMedium">
                    {riderAssigned.vehicleType || "Bike"}
                  </Text>
                </View>
              </View>
            ) : parsedOrder.delivery.status === "SEARCH_OF_RIDER" ? 
            <View>
              <Text className="text-primary-100 font-NunitoMedium">
                Order is currently being searched by riders so hold on so a rider can accept...
              </Text>
            </View>
            : (
              <TouchableOpacity
                disabled={isPushing || isSearching}
                onPress={handlePushToRiders}
                className={`mt-4 py-3 rounded-full ${
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
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VendorPushToRidersScreen;
