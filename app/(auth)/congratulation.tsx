import { View, Text, Image } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { router } from "expo-router";

const congratulation = () => {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 5500);
  });
  return (
    <SafeAreaView className="flex flex-col items-center justify-center p-5 flex-1 bg-white ">
      <View className="absolute top-0">
        <Image source={require("../../assets/images/Bubbles.png")} />
      </View>
      <Image
        source={require("../../assets/images/congratulation.png")}
        className="w-80 h-80"
      />

      <View className="mt-10">
        <Text className="text-center self-center font-RalewayBold mt-4  text-[40px]">
          Congratulations
        </Text>
        <Text className="font-NunitoLight text-xl text-center mt-4 px-6" style={{ flexShrink: 1 }}>
          Congratulations — your account has been created successfully!
        </Text>
        <Text className="font-NunitoLight text-base text-center mt-4 px-6 text-gray-600" style={{ flexShrink: 1 }}>
          Your KYC documents have been submitted and will be reviewed by our team. Once an administrator approves your KYC, you will receive an email with the outcome. Please keep an eye on your inbox (and spam folder) for updates.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default congratulation;
