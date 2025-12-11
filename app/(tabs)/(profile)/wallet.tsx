import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../global/store";
import { useRouter } from "expo-router";
import { useGetVendorWallet } from "hooks/useHooks";

export default function VendorWallet() {
  const router = useRouter();
  const user: any = useSelector((state: RootState) => state.auth.user);
  const token = user?.token || "";

  const { isLoading, wallet, isError } = useGetVendorWallet(token);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004CFF" />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-5">
        <Text className="text-center text-red-600 mb-4">
          Failed to load wallet data. Please try again later.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#004CFF] px-6 p-3 rounded-lg"
        >
          <Text className="text-white font-NunitoMedium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-16">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] p-2 rounded-full mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">My Wallet</Text>
      </View>

      {/* Balance Card */}
      <View className="bg-[#004CFF] p-6 rounded-2xl shadow-lg mb-6">
        <Text className="text-white text-lg font-NunitoMedium">
          Available Balance
        </Text>
        <Text className="text-white text-4xl font-NunitoExtraBold mt-2">
          ₦{wallet?.data?.balance?.toLocaleString() || 0}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(profile)/withdraw")}
          className="bg-white mt-4 p-3 rounded-xl"
        >
          <Text className="text-center text-[#004CFF] font-NunitoBold">
            Withdraw Funds
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="bg-white p-5 rounded-xl shadow-sm mb-6">
        <Text className="text-lg font-NunitoBold mb-3">Totals</Text>

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-500 font-NunitoMedium">Total Earned</Text>
          <Text className="font-NunitoBold">
            ₦{wallet?.data?.totalEarned?.toLocaleString() || 0}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-500 font-NunitoMedium">
            Pending Withdrawal
          </Text>
          <Text className="font-NunitoBold text-orange-500">
            ₦{wallet?.data?.pendingAmount?.toLocaleString() || 0}
          </Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-gray-500 font-NunitoMedium">
            Completed Withdrawal
          </Text>
          <Text className="font-NunitoBold text-green-600">
            ₦{wallet?.data?.withdrawn?.toLocaleString() || 0}
          </Text>
        </View>
      </View>

      {/* Withdrawal History */}
      <Text className="text-xl font-NunitoBold mb-3">Withdrawal History</Text>

      {wallet?.data?.withdrawals?.length === 0 ? (
        <Text className="text-gray-400 font-NunitoMedium text-center mt-10">
          No withdrawal history yet
        </Text>
      ) : (
        wallet?.data?.withdrawals?.map((w: any) => (
          <View key={w.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
            <View className="flex-row justify-between">
              <Text className="font-NunitoBold">
                ₦{w.amount.toLocaleString()}
              </Text>
              <Text
                className={`font-NunitoBold ${w.status === "APPROVED" ? "text-green-600" : w.status === "PENDING" ? "text-orange-500" : "text-red-600"}`}
              >
                {w.status}
              </Text>
            </View>
            <Text className="text-gray-500 mt-1">
              {new Date(w.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
