import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image
} from "react-native";
import { router } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { selectUser } from "global/authSlice";
import { useSelector } from "react-redux";
import { useMessages, useVendors } from "hooks/useHooks";
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  // Same day → show only time
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return new Intl.DateTimeFormat("en-NG", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }

  // Within same year → show "Oct 26 • 8:15 PM"
  if (date.getFullYear() === now.getFullYear()) {
    const formatted = new Intl.DateTimeFormat("en-NG", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
    return formatted.replace(",", " •");
  }

  // Otherwise → full date
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

const NotificationMessageScreen = () => {
  const user: any = useSelector(selectUser);
  const token = user?.token || "";
  const vendorId = user?.user?.vendorApplicationId || "";
  

  // ✅ Load actual messages from API
  const { isLoading, messages, isError } = useMessages(token);
    const { isLoading:userIsloading, profile, isError:userIsError } = useVendors(vendorId, token);


  const [activeTab, setActiveTab] = useState<"notifications" | "messages">(
    "notifications"
  );

  const notifications = [
    { id: "1", name: "Ajayi Segun", message: "Placed a new order", time: "20 min ago" },
    { id: "2", name: "Michael Smith", message: "Left a 5-star review", time: "1 hr ago" },
    { id: "3", name: "Paul Joseph", message: "Placed a new order", time: "2 hrs ago" },
  ];

  // console.log(JSON.stringify(messages.data,null,2));

  const renderNotificationItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center py-5 px-5 border-b border-[#F0F2F5]">
      <View className="w-12 h-12 rounded-full bg-[#A7B0BB]" />
      <View className="flex-1 ml-4">
        <Text className="text-base font-NunitoSemiBold text-[#0D1321]">
          {item.name}{" "}
          <Text className="font-NunitoRegular text-gray-400">
            {item.message}
          </Text>
        </Text>
        <Text className="text-sm font-NunitoSemiBold text-gray-400 mt-1">
          {item.time}
        </Text>
      </View>
    </View>
  );

  const renderMessageItem = ({item}:any) => (

    
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(tabs)/(notifications)/messages",
          params: { user: JSON.stringify(item?.user), seller: JSON.stringify( profile?.data)  },
        })
      }
      className="flex-row px-5 items-center py-5 border-b border-[#F0F2F5]"
    >
      {/* Avatar */}
      <View className=" relative">
      <Image className='w-12 h-12 rounded-full' source={ require("../../../assets/images/artist-2 2.png")}/>
        {item?.user.Session[0]?.isOnline && (
          <View className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E676]" />
        )}
      </View>

      {/* Name & last message */}
      <View className="flex-1 ml-4">
        <Text className="text-lg font-NunitoSemiBold text-[#0D1321]">
          {item?.user?.name || "Unknown User"}
        </Text>
        <Text
          numberOfLines={1}
          className="text-base font-NunitoRegular text-gray-400 mt-1"
        >
          {item?.lastMessage?.content || "No messages yet"}
        </Text>
      </View>

      {/* Time + unread badge */}
      <View className="items-end">
        <Text className="text-sm font-RalewayRegular text-gray-400">
          {formatDateTime(item?.lastMessage?.createdAt) || ""}
        </Text>
        {item?.unreadCount > 0 && (
          <View className="mt-2 bg-[#004CFF] w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white font-NunitoBold text-sm">
              {item?.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  
  );

  if (isLoading || userIsloading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004CFF" />
        <Text className="mt-3 font-NunitoMedium text-gray-500">
          Loading messages...
        </Text>
      </View>
    );
  }

  if (isError || userIsError) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 font-NunitoSemiBold">
          Failed to load messages
        </Text>
      </View>
    );
  }

  const hasMessages = messages && messages?.data.length > 0;

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
            <Text
              className={`text-base ${
                activeTab === "notifications"
                  ? "text-[#004CFF] font-NunitoBold"
                  : "text-gray-400 font-NunitoMedium"
              }`}
            >
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("messages")}
            className="flex-1 py-2 items-center"
          >
            <Text
              className={`text-base ${
                activeTab === "messages"
                  ? "text-[#004CFF] font-NunitoBold"
                  : "text-gray-400 font-NunitoMedium"
              }`}
            >
              Messages ({messages?.data.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab underline */}
        <View className="h-0.5 bg-[#F0F2F5] mt-2 relative">
          <View
            className="absolute h-0.5 bg-[#004CFF]"
            style={{
              width: "40%",
              left: activeTab === "notifications" ? "8%" : "52%",
            }}
          />
        </View>
      </View>

      {/* Content List */}
      <FlatList
        data={activeTab === "notifications" ? notifications : messages?.data || []}
        keyExtractor={(item, index) => item.id?.toString() || `msg-${index}`}
        renderItem={
          activeTab === "notifications"
            ? renderNotificationItem
            : renderMessageItem
        }
        ListEmptyComponent={() => (
          <View className="mt-20 items-center">
            <Text className="text-gray-400 font-NunitoMedium">
              {activeTab === "notifications"
                ? "No notifications yet"
                : "No messages yet"}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationMessageScreen;
