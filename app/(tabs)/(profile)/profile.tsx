import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { logoutState, selectIsVisitor, VisitorState } from "global/authSlice";
import Withdrawal from "../../../assets/icons/withdrawal.svg";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const select = useSelector(selectIsVisitor);
  const menuItems = [
    {
      title: "Personal Info",
      icon: <MaterialCommunityIcons name="account" size={24} color="#0056FF" />,
      color: "#0056FF",
      route: "personal-info",
    },
    {
      title: "Withdrawal History",
      icon: <Withdrawal width={24} height={24} color="#FF8C00" />,
      color: "#8B5CF6",
      route: "withdraw",
    },
  ];

  const accountItems = [
    {
      title: "Number of Order",
      icon: <FontAwesome6 name="bag-shopping" size={24} color="#5C67F2" />,
      color: "#5C67F2",
      route: "order",
    },
    {
      title: "User Reviews",
      icon: <MaterialIcons name="reviews" size={24} color="#2AE1E1" />,
      color: "#5C67F2",
      route: "reviews",
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-primary-100 p-5 mt-10 rounded-xl">
        <View className="flex-row items-center ">
              <TouchableOpacity className="bg-[#ECF0F4] p-2 rounded-full">
                <Ionicons name="chevron-back" size={22} color="black" />
              </TouchableOpacity>
              <Text className="text-2xl ml-10 font-RalewayBold text-white">My Profile</Text>

            </View>
            <View className="flex flex-col items-center mt-5">
              <Text className="text-xl font-RalewayRegular text-white ">Available Balance</Text>
              <Text className="text-5xl mt-2 font-NunitoBold text-white ">₦500,000.00</Text>
              <TouchableOpacity className="mt-4 bg-transparent px-6 p-2 rounded-lg border-2 border-white">
                <Text className="text-white font-NunitoMedium">Withdraw</Text>
                </TouchableOpacity>
            </View>
            </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60 }}
      >
  

        
        
            {/* Profile Info Section */}
            <View className="bg-[#F8F9FA] rounded-2xl p-3 mb-5">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100"
                  onPress={() => router.push(`/(tabs)/(profile)/${item.route}`)}
                >
                  <View className="flex-row items-center space-x-6 gap-3">
                    {item.icon}
                    <Text className="font-NunitoRegular text-lg text-gray-700">
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Account Section */}
            <View className="bg-[#F8F9FA] rounded-2xl p-3 mb-5">
              {accountItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100"
                  onPress={() => router.push(`/(tabs)/(profile)/${item.route}`)}
                >
                  <View className="flex-row items-center space-x-6 gap-3">
                    {item.icon}
                    <Text className="font-NunitoRegular text-lg text-gray-700">
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          
        

        {/* Logout */}
        <TouchableOpacity
          className="bg-[#F8F9FA] rounded-2xl flex-row items-center justify-between p-4 mb-10"
          onPress={() => {
            if(!select){
              dispatch(logoutState());
            }else{
              router.replace("/(auth)/login")
              dispatch(VisitorState(false));
            }
          }}
        >
          <Text className="font-NunitoRegular text-lg text-gray-700">
            Log Out
          </Text>
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
