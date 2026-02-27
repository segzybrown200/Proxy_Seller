import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
import { usePaymentHistory } from "hooks/useHooks";

const PAYMENT_STATUS = {
  COMPLETED: { label: "COMPLETED", color: "#10B981", bgColor: "#D1FAE5" },
  PENDING: { label: "PENDING", color: "#F59E0B", bgColor: "#FEF3C7" },
  FAILED: { label: "FAILED", color: "#EF4444", bgColor: "#FEE2E2" },
  REFUNDED: { label: "REFUNDED", color: "#6B7280", bgColor: "#F3F4F6" },
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const user: any = useSelector(selectUser);
  const token = user?.token || "";
  
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const { payments, summary, pagination, isLoading, mutate, isError } = usePaymentHistory(
    token,
    limit,
    skip,
    selectedStatus
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      setSkip(skip + limit);
    }
  };

  const statuses = [
    { key: undefined, label: "All" },
    { key: "COMPLETED", label: "Completed" }, 
    { key: "PENDING", label: "Pending" },
    { key: "FAILED", label: "Failed" },
    { key: "REFUNDED", label: "Refunded" },
  ];

  const renderPaymentCard = ({ item }: { item: any }) => {
    const statusInfo = PAYMENT_STATUS[item.status as keyof typeof PAYMENT_STATUS] || PAYMENT_STATUS.PENDING;
    const totalAmount = item.totalAmount || 0;
    const netAmount = item.netAmount || 0;

    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: "/(tabs)/(profile)/payment-details/[id]",
          params: { id: item.transactionId }
        })}
        className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-primary-100  items-center justify-center">
              <FontAwesome6 name="money-bill" size={20} color="white" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-NunitoBold text-gray-900 text-base">
                Order #{item.orderId?.slice(0, 8) || "N/A"}
              </Text>
              <Text className="font-NunitoRegular text-gray-500 text-sm">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View
            style={{ backgroundColor: statusInfo.bgColor }}
            className="px-3 py-1 rounded-full"
          >
            <Text
              style={{ color: statusInfo.color }}
              className="font-NunitoMedium text-xs"
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View className="bg-gray-50 rounded-xl p-3 mb-3">
          <View className="flex-row justify-between mb-2">
            <Text className="font-NunitoRegular text-gray-600 text-sm">
              Subtotal
            </Text>
            <Text className="font-NunitoBold text-gray-900">
              ₦{(item.subtotal || 0).toLocaleString()}
            </Text>
          </View>
          {item.shippingFee > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="font-NunitoRegular text-gray-600 text-sm">
                Shipping
              </Text>
              <Text className="font-NunitoBold text-gray-900">
                ₦{item.shippingFee.toLocaleString()}
              </Text>
            </View>
          )}
          {item.commission > 0 && (
            <View className="flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-NunitoRegular text-gray-600 text-sm">
                Commission ({item.commissionRate}%)
              </Text>
              <Text className="font-NunitoBold text-red-500">
                -₦{item.commission.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="font-NunitoRegular text-gray-600">
            Net Earnings
          </Text>
          <Text className="font-NunitoBold text-lg text-green-600">
            ₦{netAmount.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary-100 px-5 pt-8 pb-6 rounded-b-3xl ">
        <View className="flex-row items-center mb-6 mt-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl ml-4 font-RalewayBold text-white">
            Payment History
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="font-NunitoRegular text-white/70 text-sm mb-1">
                Total Revenue
              </Text>
              <Text className="font-NunitoBold text-white text-xl">
                ₦{summary?.totalRevenue?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-NunitoRegular text-white/70 text-sm mb-1">
                Total Transactions
              </Text>
              <Text className="font-NunitoBold text-white text-xl">
                {summary?.totalTransactions || 0}
              </Text>
            </View>
          </View>
          <View className="bg-white/10 h-px my-2" />
          <View className="flex-row justify-between">
            <View>
              <Text className="font-NunitoRegular text-white/70 text-sm mb-1">
                Commissions
              </Text>
              <Text className="font-NunitoBold text-red-300 text-lg">
                -₦{summary?.totalCommission?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-NunitoRegular text-white/70 text-sm mb-1">
                Avg. Value
              </Text>
              <Text className="font-NunitoBold text-white text-lg">
                ₦{summary?.averageTransactionValue?.toLocaleString() || "0"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status Filters */}
      <View className="px-5 pt-4 pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.key}
              onPress={() => {
                setSelectedStatus(status.key);
                setSkip(0);
              }}
              className={`mr-3 px-4 py-2 rounded-full border ${
                selectedStatus === status.key
                  ? "bg-blue-500 border-blue-500"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <Text
                className={`font-NunitoMedium text-sm ${
                  selectedStatus === status.key ? "text-white" : "text-gray-700"
                }`}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Payment List */}
      {isLoading && !refreshing && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0056FF" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-5">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#EF4444"
          />
          <Text className="text-gray-700 font-NunitoMedium mt-3 text-center">
            Failed to load payment history
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-NunitoMedium">Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && payments.length === 0 && !isError && (
        <View className="flex-1 items-center justify-center px-5">
          <MaterialCommunityIcons
            name="inbox-multiple-outline"
            size={48}
            color="#D1D5DB"
          />
          <Text className="text-gray-500 font-NunitoMedium mt-3">
            No payments yet
          </Text>
        </View>
      )}

      {payments.length > 0 && (
        <FlatList
          data={payments}
          renderItem={renderPaymentCard}
          keyExtractor={(item, index) => `${item.transactionId}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          scrollEnabled={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0056FF"
            />
          }
        />
      )}

      {/* Load More Button */}
      {pagination.hasMore && payments.length > 0 && (
        <TouchableOpacity
          onPress={handleLoadMore}
          className="mx-5 mb-6 bg-blue-500 py-3 rounded-xl items-center"
        >
          <Text className="text-white font-NunitoMedium">Load More</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
