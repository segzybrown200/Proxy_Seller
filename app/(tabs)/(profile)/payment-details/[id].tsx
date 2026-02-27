import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
import { usePaymentDetail } from "hooks/useHooks";

const STATUS_CONFIG = {
  COMPLETED: { label: "Completed", color: "#10B981", bgColor: "#D1FAE5" },
  PENDING: { label: "Pending", color: "#F59E0B", bgColor: "#FEF3C7" },
  FAILED: { label: "Failed", color: "#EF4444", bgColor: "#FEE2E2" },
  REFUNDED: { label: "Refunded", color: "#6B7280", bgColor: "#F3F4F6" },
};

const ESCROW_STATUS_CONFIG = {
  PENDING: { label: "In Escrow", color: "#F59E0B", bgColor: "#FEF3C7" },
  RELEASED: { label: "Released", color: "#10B981", bgColor: "#D1FAE5" },
  DISPUTED: { label: "Disputed", color: "#EF4444", bgColor: "#FEE2E2" },
};

export default function PaymentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const user: any = useSelector(selectUser);
  const token = user?.token || "";


  const { transaction, isLoading, isError } = usePaymentDetail(
    id as string,
    token
  );

  console.log(JSON.stringify(transaction, null,2))

  const statusInfo =
    STATUS_CONFIG[transaction?.paymentDetails?.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.PENDING;
  const escrowInfo =
    ESCROW_STATUS_CONFIG[
      transaction?.escrowDetails?.status as keyof typeof ESCROW_STATUS_CONFIG
    ] || ESCROW_STATUS_CONFIG.PENDING;

  const handleOpenReceipt = () => {
    if (transaction?.paymentDetails?.receiptUrl) {
      Linking.openURL(transaction.paymentDetails.receiptUrl).catch(() => {
        Alert.alert("Error", "Could not open receipt");
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0056FF" />
      </SafeAreaView>
    );
  }

  if (isError || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-5 pt-6 mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl ml-4 font-RalewayBold text-gray-900">
            Payment Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#EF4444"
          />
          <Text className="text-gray-700 font-NunitoMedium mt-3">
            Failed to load transaction details
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-100 px-5 pt-6 pb-8 rounded-b-3xl mt-10">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-RalewayBold text-white flex-1 ml-4">
              Payment Details
            </Text>
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

          {/* Total Amount */}
          <View className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/20">
            <Text className="font-NunitoRegular text-white/70 text-sm mb-2">
              Total Amount
            </Text>
            <Text className="font-NunitoBold text-white text-4xl mb-3">
              ₦{transaction.paymentBreakdown?.grossAmount?.toLocaleString()}
            </Text>
            <Text className="font-NunitoRegular text-white/70 text-sm">
              Order #{transaction.orderId?.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View className="px-5 py-6">
          {/* Payment Breakdown */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-5">
              <MaterialCommunityIcons
                name="receipt"
                size={24}
                color="#0056FF"
              />
              <Text className="text-lg font-NunitoBold text-gray-900 ml-3">
                Payment Breakdown
              </Text>
            </View>

            {/* Breakdown Items */}
            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
              <View className="flex-row justify-between">
                <Text className="font-NunitoRegular text-gray-600">
                  Subtotal
                </Text>
                <Text className="font-NunitoBold text-gray-900">
                  ₦{transaction.paymentBreakdown?.subtotal?.toLocaleString()}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="font-NunitoRegular text-gray-600">
                  Shipping Fee
                </Text>
                <Text className="font-NunitoBold text-gray-900">
                  ₦{transaction.paymentBreakdown?.shippingFee?.toLocaleString()}
                </Text>
              </View>

              <View className="border-t border-gray-200 pt-3 flex-row justify-between">
                <Text className="font-NunitoMedium text-gray-700">
                  Gross Amount
                </Text>
                <Text className="font-NunitoBold text-gray-900">
                  ₦{transaction.paymentBreakdown?.grossAmount?.toLocaleString()}
                </Text>
              </View>

              <View className="bg-red-50 rounded-lg p-3 flex-row justify-between border border-red-200">
                <View>
                  <Text className="font-NunitoRegular text-red-700 text-sm">
                    Platform Commission
                  </Text>
                  <Text className="font-NunitoMedium text-red-700 text-xs mt-1">
                    ({transaction.paymentBreakdown?.platformCommission?.percentage}%)
                  </Text>
                </View>
                <Text className="font-NunitoBold text-red-600">
                  -₦{transaction.paymentBreakdown?.platformCommission?.amount?.toLocaleString()}
                </Text>
              </View>

              <View className="bg-green-50 rounded-lg p-3 flex-row justify-between border-2 border-green-200">
                <Text className="font-NunitoBold text-green-700">
                  Your Net Earnings
                </Text>
                <Text className="font-NunitoBold text-green-600 text-lg">
                  ₦{transaction.paymentBreakdown?.netEarnings?.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Order Items */}
          {transaction.items && transaction.items.length > 0 && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <FontAwesome6
                  name="bag-shopping"
                  size={20}
                  color="#0056FF"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-lg font-NunitoBold text-gray-900">
                  Items Ordered
                </Text>
              </View>

              {transaction.items.map((item: any, index: number) => (
                <View key={index} className="mb-4 pb-4 border-b border-gray-200">
                  <View className="flex-row justify-between mb-2">
                    <Text
                      numberOfLines={2}
                      className="font-NunitoMedium text-gray-900 flex-1 pr-2"
                    >
                      {item.title}
                    </Text>
                    <Text className="font-NunitoBold text-gray-900">
                      ₦{item.totalPrice?.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="font-NunitoRegular text-gray-600 text-sm">
                      ₦{item.unitPrice?.toLocaleString()} × {item.quantity}
                    </Text>
                    <Text className="font-NunitoRegular text-gray-600 text-sm">
                      Qty: {item.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Buyer Information */}
          {transaction.buyerInfo && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="account-circle-outline"
                  size={24}
                  color="#0056FF"
                />
                <Text className="text-lg font-NunitoBold text-gray-900 ml-3">
                  Buyer Information
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="account"
                    size={18}
                    color="#6B7280"
                  />
                  <Text className="font-NunitoRegular text-gray-700 ml-3">
                    {transaction.buyerInfo.name || "N/A"}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color="#6B7280"
                  />
                  <Text className="font-NunitoRegular text-gray-700 ml-3">
                    {transaction.buyerInfo.email || "N/A"}
                  </Text>
                </View>
                {transaction.buyerInfo.phone && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="phone"
                      size={18}
                      color="#6B7280"
                    />
                    <Text className="font-NunitoRegular text-gray-700 ml-3">
                      {transaction.buyerInfo.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Delivery Information */}
          {transaction.delivery && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <FontAwesome6 name="truck" size={20} color="#0056FF" />
                <Text className="text-lg font-NunitoBold text-gray-900 ml-3">
                  Delivery Details
                </Text>
              </View>

              <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                {transaction.delivery.status && (
                  <View className="flex-row justify-between">
                    <Text className="font-NunitoRegular text-gray-600">
                      Status
                    </Text>
                    <Text className="font-NunitoBold text-gray-900 capitalize">
                      {transaction.delivery.status}
                    </Text>
                  </View>
                )}

                {transaction.delivery.shippingFee > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="font-NunitoRegular text-gray-600">
                      Shipping Fee
                    </Text>
                    <Text className="font-NunitoBold text-gray-900">
                      ₦{transaction.delivery.shippingFee?.toLocaleString()}
                    </Text>
                  </View>
                )}

                {transaction.delivery.etaMinutes && (
                  <View className="flex-row justify-between">
                    <Text className="font-NunitoRegular text-gray-600">
                      ETA
                    </Text>
                    <Text className="font-NunitoBold text-gray-900">
                      {transaction.delivery.etaMinutes} mins
                    </Text>
                  </View>
                )}

                {transaction.delivery.pickupAddress && (
                  <View className="border-t border-gray-200 pt-3">
                    <Text className="font-NunitoMedium text-gray-700 mb-2">
                      Pickup Address
                    </Text>
                    <Text className="font-NunitoRegular text-gray-600 text-sm">
                      {transaction.delivery.pickupAddress}
                    </Text>
                  </View>
                )}

                {transaction.delivery.dropoffAddress && (
                  <View className="border-t border-gray-200 pt-3">
                    <Text className="font-NunitoMedium text-gray-700 mb-2">
                      Dropoff Address
                    </Text>
                    <Text className="font-NunitoRegular text-gray-600 text-sm">
                      {transaction.delivery.dropoffAddress}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Escrow Details */}
          {transaction.escrowDetails && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="shield-account-outline"
                  size={24}
                  color="#0056FF"
                />
                <Text className="text-lg font-NunitoBold text-gray-900 ml-3">
                  Escrow Status
                </Text>
              </View>

              <View
                style={{ backgroundColor: escrowInfo.bgColor, borderColor: escrowInfo.color }}
                className="rounded-xl p-4 flex-row items-center justify-between border"
              >
                <View>
                  <Text
                    style={{ color: escrowInfo.color }}
                    className="font-NunitoBold"
                  >
                    {escrowInfo.label}
                  </Text>
                  {transaction.escrowDetails.releaseDate && (
                    <Text
                      style={{ color: escrowInfo.color }}
                      className="font-NunitoRegular text-xs mt-1"
                    >
                      Release:{" "}
                      {new Date(
                        transaction.escrowDetails.releaseDate
                      ).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons
                  name={
                    transaction.escrowDetails.status === "released"
                      ? "check-circle"
                      : "clock-outline"
                  }
                  size={28}
                  color={escrowInfo.color}
                />
              </View>
            </View>
          )}

          {/* Payment Method & Dates */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
            <View className="space-y-3">
              {transaction.paymentDetails?.method && (
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="credit-card"
                      size={20}
                      color="#0056FF"
                    />
                    <Text className="font-NunitoRegular text-gray-700 ml-3">
                      Payment Method
                    </Text>
                  </View>
                  <Text className="font-NunitoBold text-gray-900 capitalize">
                    {transaction.paymentDetails.method}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={20}
                    color="#0056FF"
                  />
                  <Text className="font-NunitoRegular text-gray-700 ml-3">
                    Date
                  </Text>
                </View>
                <Text className="font-NunitoBold text-gray-900">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {transaction.paymentDetails?.receiptUrl && (
                <TouchableOpacity
                  onPress={handleOpenReceipt}
                  className="flex-row items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200"
                >
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      color="#0056FF"
                    />
                    <Text className="font-NunitoMedium text-blue-600 ml-3">
                      View Receipt
                    </Text>
                  </View>
                  <AntDesign name="right" size={18} color="#0056FF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Review Section */}
          {transaction.review && (
            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <AntDesign name="star" size={20} color="#F59E0B" />
                <Text className="text-lg font-NunitoBold text-gray-900 ml-3">
                  Customer Review
                </Text>
              </View>

              <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <View className="flex-row items-center mb-2">
                  <View className="flex-row">
                    {[...Array(transaction.review.rating)].map((_, i) => (
                      <AntDesign
                        key={i}
                        name="star"
                        size={16}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text className="font-NunitoBold text-gray-900 ml-2">
                    {transaction.review.rating} Stars
                  </Text>
                </View>
                {transaction.review.comment && (
                  <Text className="font-NunitoRegular text-gray-700 text-sm mt-2">
                    "{transaction.review.comment}"
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
