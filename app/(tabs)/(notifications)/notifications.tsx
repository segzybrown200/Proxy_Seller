import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

const NotificationMessageScreen = () => {
  const [activeTab, setActiveTab] = useState<"notifications" | "messages">(
    "notifications"
  );

  const notifications = [
    { id: "1", name: "Ajayi Segun", message: "Placed a new order", time: "20 min ago" },
    { id: "2", name: "Michael Smith", message: "left a 5 star review", time: "20 min ago" },
    { id: "3", name: "Paul Joseph", message: "Placed a new order", time: "20 min ago" },
  ];

  const messages = [
    { id: "1", name: "Sola Demi", message: "Sounds awesome!", time: "19:37", unread: 1 },
    { id: "2", name: "Michael Williamson", message: "Ok, Just hurry up little bit...😊", time: "19:37", unread: 2 },
    { id: "3", name: "Travis Edwards", message: "Thanks dude.", time: "19:37", unread: 0 },
  ];

  const renderNotificationItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center py-5 px-5 border-b border-[#F0F2F5]">
      <View className="w-12 h-12 rounded-full bg-[#A7B0BB]" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-NunitoSemiBold text-[#0D1321]">
          {item.name} <Text className="font-NunitoRegular text-gray-400"> {item.message}</Text>
        </Text>
        <Text className="text-sm font-NunitoSemiBold text-gray-400 mt-1">{item.time}</Text>
      </View>
    </View>
  );

  const renderMessageItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={()=> router.push("/(tabs)/(notifications)/messages")} className="flex-row px-5 items-center py-5 border-b border-[#F0F2F5]">
      <View className="w-12 h-12 rounded-full bg-[#A7B0BB] relative">
        <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E676]" />
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-lg font-NunitoSemiBold text-[#0D1321]">{item.name}</Text>
        <Text className="text-base font-NunitoRegular text-gray-400 mt-1">{item.message}</Text>
      </View>

      <View className="items-end">
        <Text className="text-sm font-RalewayRegular text-gray-400">{item.time}</Text>
        {item.unread > 0 ? (
          <View className="mt-2 bg-[#004CFF] w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white font-NunitoBold text-sm">{item.unread}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-16 pb-4">
        <TouchableOpacity
          className="bg-[#F1F4F9] p-3 rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#0D1321" />
        </TouchableOpacity>

        <Text className="text-2xl font-NunitoSemiBold text-[#0D1321] ml-4">
          {activeTab === "notifications" ? "Notifications" : "Messages"}
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-5">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setActiveTab("notifications")}
            className="flex-1 py-2 items-center"
          >
            <Text className={`text-base ${activeTab === "notifications" ? "text-[#004CFF] font-NunitoBold" : "text-gray-400 font-NunitoMedium"}`}>
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("messages")}
            className="flex-1 py-2 items-center"
          >
            <Text className={`text-base ${activeTab === "messages" ? "text-[#004CFF] font-NunitoBold" : "text-gray-400 font-NunitoMedium"}`}>
              Messages (3)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Underline indicator / divider */}
        <View className="h-0.5 bg-[#F0F2F5] mt-2 relative">
          <View
            className={`absolute h-0.5 bg-[#004CFF]`}
            style={{
              width: "40%",
              left: activeTab === "notifications" ? "8%" : "52%",
            }}
          />
        </View>
      </View>

      {/* Content list */}
      <FlatList
        data={activeTab === "notifications" ? notifications : messages}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === "notifications" ? renderNotificationItem : renderMessageItem}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* bottom spacing to match your design */}
      <View className="h-40" />
    </View>
  );
};

export default NotificationMessageScreen;
