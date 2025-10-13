import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomButton from "components/CustomButton";

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Nike Sneaker",
      variant: "Pink, Size M",
      price: 23000,
      image: require("../../assets/images/sneaker.png"),
      qty: 1,
    },
    {
      id: 2,
      name: "Watch",
      variant: "Black, Size M",
      price: 23000,
      image:require("../../assets/images/sneaker.png"),
      qty: 1,
    },
  ]);

  const increaseQty = (id:number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id:number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const removeItem = (id:number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <View className="items-center">
          <View className="bg-[#F6F6F6] p-6 rounded-full mb-5">
            <Ionicons name="bag-outline" size={60} color="#0056FF" />
          </View>
          <Text className="text-3xl font-RalewayBold">Your Cart is Empty</Text>
          <Text className="text-center text-xl text-gray-500 mt-2 w-70 font-NunitoLight">
            Looks like you haven’t added any items yet. Start shopping and
            discover products you’ll love
          </Text>
         <View className="w-full px-5 flex flex-row mt-6">
          <CustomButton title="Start Shopping" handlePress1={()=>router.push("/(tabs)/(home)")}/>
         </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-12 p-5 mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity className="bg-primary-100 rounded-full p-2" onPress={() => router.back()}>
            <Ionicons name="grid-outline" size={20} color="white" />
          </TouchableOpacity>
          </View>
        <Text className="text-3xl font-RalewayBold ml-2">Cart</Text>
        <View className="bg-[#0056FF] ml-2 px-2 rounded-full">
          <Text className="text-white font-NunitoBold text-sm">
            {cartItems.length}
          </Text>
        </View>
      </View>

      {/* Cart List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      >
        {cartItems.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center bg-[#F6F6F6] rounded-2xl p-3 mb-4"
          >
            <Image
              source={item.image}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />

            <View className="flex-1 ml-4">
              <Text className="font-NunitoBold text-base">{item.name}</Text>
              <Text className="font-NunitoRegular text-gray-500">
                {item.variant}
              </Text>
              <Text className="font-NunitoBold text-lg mt-1">
                ₦{item.price.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              className="absolute top-2 left-2 bg-white p-1.5 rounded-full shadow-sm"
            >
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => decreaseQty(item.id)}
                className="bg-[#EEF1FF] p-1 rounded-full"
              >
                <Ionicons name="remove-outline" size={22} color="#0056FF" />
              </TouchableOpacity>
              <Text className="mx-2 text-base font-NunitoBold">
                {item.qty}
              </Text>
              <TouchableOpacity
                onPress={() => increaseQty(item.id)}
                className="bg-[#EEF1FF] p-1 rounded-full"
              >
                <Ionicons name="add-outline" size={22} color="#0056FF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Total + Checkout */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100 shadow-lg">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-600 font-NunitoRegular text-lg">
            Total
          </Text>
          <Text className="text-2xl font-NunitoBold text-[#0056FF]">
            ₦{total.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(home)/payment")}
          className="bg-[#0056FF] py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-NunitoBold text-lg">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;
