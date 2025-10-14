import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface WithdrawItem {
  id: string;
  amount: string;
  date: string;
  status: "Pending" | "Completed" | "Failed";
  method: string;
}

const withdrawData: WithdrawItem[] = [
  {
    id: "1",
    amount: "₦15000.00",
    date: "12 Oct 2025",
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: "2",
    amount: "₦8500.00",
    date: "09 Oct 2025",
    status: "Pending",
    method: "PayPal",
  },
  {
    id: "3",
    amount: "₦22000.00",
    date: "01 Oct 2025",
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: "4",
    amount: "₦60000.00",
    date: "28 Sept 2025",
    status: "Failed",
    method: "Crypto Wallet",
  },
];

const WithdrawCard: React.FC<{ item: WithdrawItem }> = ({ item }) => {
  const getStatusColor = (status: WithdrawItem["status"]) => {
    switch (status) {
      case "Completed":
        return "text-green-500";
      case "Pending":
        return "text-yellow-500";
      case "Failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-400 text-base font-NunitoMedium">
          {item.date}
        </Text>
        <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg text-gray-900 font-NunitoRegular">
            {item.method}
          </Text>
          <Text className={`text-base mt-1 font-NunitoLight ${getStatusColor(item.status)}`}>
            {item.status}
          </Text>
        </View>
        <Text className="text-lg font-NunitoRegular text-gray-900">
          {item.amount}
        </Text>
      </View>
    </View>
  );
};

const WithdrawHistory: React.FC<{ navigation?: any }> = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-10 mb-5 p-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 p-2 rounded-full mr-3"
        >
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>
        <Text className="text-xl text-gray-800 font-RalewaySemiBold">
          Withdraw History
        </Text>
      </View>

      {/* History List */}
      <FlatList
        data={withdrawData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WithdrawCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default WithdrawHistory;
