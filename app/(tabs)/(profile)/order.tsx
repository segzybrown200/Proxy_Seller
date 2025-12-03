import { router } from "expo-router";
import { selectUser } from "global/authSlice";
import { useOrders } from "hooks/useHooks";
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

const OrderScreen = () => {
  const [active, setActive] = useState<"orders">("orders");
  const user: any = useSelector(selectUser);
  const token = user?.token || "";

  const { isLoading, orders:data, isError } = useOrders(token);


  const orders = useMemo(() => data?.data ?? [], [data]);


  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(tabs)/(profile)/track-order",
          params: { order: JSON.stringify(item, null,2) },
        })
      }
      activeOpacity={0.8}
      className="bg-white rounded-lg mx-2 my-2 p-3 flex-row items-center justify-between"
    >
      <View className="flex-row w-[60%] items-center">
        <Image
          source={{
            uri:
              item.listings[0]?.image ||
              "https://via.placeholder.com/100",
          }}
          className="w-16 h-16 rounded-md mr-3"
        />
        <View>
          <Text className="text-lg font-RalewaySemiBold text-black">
            {item.listings[0]?.title || "Untitled"}
          </Text>
          <Text numberOfLines={2} className="text-base  font-NunitoLight text-primary-100 mt-1">
            {item.delivery?.dropoffAddress || "No address"}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-xs font-NunitoRegular text-gray-400">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text
          className={`text-base mt-1 font-NunitoMedium ${
            item.status === "DELIVERED"
              ? "text-green-500"
              : "text-primary-100"
          }`}
        >
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-5">
      {/* Header */}
      <View className="flex-row items-center mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full mt-4 p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Orders</Text>
      </View>

      {/* Tab */}
      <View className="flex-row mt-4 mb-5 px-4">
        <TouchableOpacity
          onPress={() => setActive("orders")}
          className={`flex-1 py-2 items-center ${
            active === "orders" ? "border-b-2 border-primary-100" : ""
          }`}
        >
          <Text
            className={`font-NunitoSemiBold text-lg ${
              active === "orders" ? "text-black" : "text-gray-500"
            }`}
          >
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* States: Loading / Error / Empty / Data */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#004CFF" />
          <Text className="mt-2 text-gray-600 font-NunitoMedium">
            Loading orders...
          </Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-NunitoSemiBold">
            Failed to load orders
          </Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          {/* <Image
            source={require("../../../assets/images/empty-box.png")}
            className="w-32 h-32 mb-3"
            resizeMode="contain"
          /> */}
          <Text className="text-gray-500 font-NunitoMedium text-lg">
            No orders found
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderScreen;
