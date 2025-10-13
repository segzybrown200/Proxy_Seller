import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import CustomButton from "../../components/CustomButton";
import Octicons from '@expo/vector-icons/Octicons';
import { router } from "expo-router";

const onboarding = () => {
  const handleVisitor = () => {
    // set visitor state and navigate to main app
    router.push({pathname: "/(auth)/location", params: { visitor: 'true' }});
  }
  return (
    <SafeAreaView className="flex-1 p-5">
      <View className="flex flex-row  items-center justify-between w-full">
        <Image
          source={require("../../assets/images/Proxy Logo 2.png")}
          className="w-32 h-32"
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleVisitor} >
          <Text className="font-RalewayMedium underline cursor-pointer text-primary-100  text-2xl">
            Continue as Visitor
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-col justify-center items-center">
        <Image
        source={require("../../assets/images/shopping.png")}
          className="w-full h-72"
          resizeMode="contain"
          style={{ transform: [{ scale: 1.1 }] }}
          resizeMethod="resize"
        />
        <Image
        source={require("../../assets/images/Proxy Logo 2.png")}
          className="w-40 h-40"
          resizeMode="contain"
        />
      </View>
      <Text className="font-NunitoLight text-2xl w-[70%] text-center self-center">
        Find Items and sellers close to you with location-aware search
      </Text>
      <View className="flex flex-1 justify-end  flex-col mb-10">
        <CustomButton title="Let's get started" handlePress={()=>router.push("/(auth)/register")}/>
       <TouchableOpacity onPress={() => router.push("/(auth)/login")}
        className="flex flex-row justify-center items-center mt-6">
         <Text className="font-NunitoLight text-xl ">I already have an account</Text>
         <View className="px-2 py-1 ml-2  bg-primary-100 rounded-full">
            <Octicons name="arrow-right" size={22} color="white" />
         </View>
       </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default onboarding;
