import React from "react";
import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Octicons from "@expo/vector-icons/Octicons";
import CustomButton from "../../components/CustomButton";

const SellerOnboarding = () => {
  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-6">
      {/* Top Logo */}
      <View className="flex flex-row justify-between items-center">
        <Image
          source={require("../../assets/images/Proxy Logo 2.png")}
          className="w-28 h-28"
          resizeMode="contain"
        />
      </View>

      {/* Hero Section */}
      <View className="flex-1 justify-center items-center">
        <Image
          source={require("../../assets/images/seller.png")}
          className="w-full h-80"
          resizeMode="contain"
        />

        <Text className="text-3xl font-NunitoLight text-center text-gray-800 mt-6">
          Start Selling Effortlessly
        </Text>

        <Text className="text-lg text-center text-gray-500 font-NunitoLight mt-2 w-[80%]">
          Create your store, upload your items, and reach more buyers nearby.
        </Text>
      </View>

      {/* Bottom Buttons */}
      <View className="mb-16">
        <CustomButton
          title="Get Started"
          handlePress={() => router.push("/(auth)/register")}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="flex flex-row justify-center items-center mt-6"
        >
          <Text className="text-lg font-NunitoLight text-gray-700">
            I already have an account
          </Text>
          <View className="px-2 py-1 ml-2 bg-primary-100 rounded-full">
            <Octicons name="arrow-right" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SellerOnboarding;
