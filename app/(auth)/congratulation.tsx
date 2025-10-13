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
        <Text className="font-NunitoLight text-xl text-center self-center mt-4 w-[70%]">
          U have successfully registered as a user, Shop well
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default congratulation;
