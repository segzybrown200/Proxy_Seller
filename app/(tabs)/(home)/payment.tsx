import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Paystack, paystackProps } from "react-native-paystack-webview";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { selectIsVisitor, VisitorState } from "global/authSlice";

export default function PaymentScreen() {
  const isVistor = useSelector(selectIsVisitor)
  const dispatch = useDispatch();
  const [shipping, setShipping] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(null);

  const totalAmount = 23000; // Replace with your calculated total

  const handlePaymentSuccess = async (res: any) => {
    console.log("✅ Payment Successful:", res);
    setShowPaystack(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)/(home)/congratulations");
    }, 2500);
  };

  const handlePaymentCancel = () => {
    setShowPaystack(false);
    Alert.alert("Payment Cancelled", "You cancelled the transaction.");
  };

  const initiatePayment = () => {
    if(isVistor){
      Alert.alert("Action Required", "Please log in to proceed with the payment.", [
        { text: "Cancel", style: "cancel" },
        { text: "Log In", onPress: () => {
          dispatch(VisitorState(false));
          router.replace("/(auth)/login")
        } },
      ]);
      return;
    }else{
      setShowPaystack(true);
    }

  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white px-5 pt-12"
    >
      <View className=" mt-7 mb-7 flex flex-row items-center gap-4 ">
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-[#ECF0F4] p-2"
        >
          <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="font-RalewaySemiBold text-2xl">Payment</Text>
      </View>

      {/* Address */}
      <View className="bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="text-gray-500 font-NunitoBold mb-1">
              Shipping Address
            </Text>
            <Text className="text-gray-800 font-NunitoLight leading-5">
              Ikate Lekki Phase 1 Lekki-Epe Express way Off {"\n"}
              Lekki Phase 1 102031 Lagos Nigeria
            </Text>
          </View>
          <TouchableOpacity className="bg-primary-50 rounded-full p-2">
            <Feather name="edit-2" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact */}
      <View className="bg-gray-50 p-4 rounded-2xl mb-5 border border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="text-gray-500 font-NunitoMedium mb-1">
              Contact Information
            </Text>
            <Text className="text-gray-800 font-NunitoLight">+23432000000</Text>
            <Text className="text-gray-800 font-NunitoLight">
              amandamorgan@example.com
            </Text>
          </View>
          <TouchableOpacity className="bg-primary-50 rounded-full p-2">
            <Feather name="edit-2" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items */}
      <Text className="text-xl font-semibold mb-2 font-NunitoBold">Items</Text>
      <View className="flex-row items-center mb-6">
        <Image
          source={require("../../../assets/images/sneaker.png")}
          resizeMode="cover"
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-gray-700 font-NunitoExtraBold text-lg">
            Nike Sneakers
          </Text>
        </View>
        <Text className="font-RalewayBold text-xl text-gray-900">₦23,000</Text>
      </View>
      <View className="flex-row items-center mb-6">
        <Image
          source={require("../../../assets/images/sneaker.png")}
          resizeMode="cover"
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-gray-700 font-NunitoExtraBold text-lg">
            Nike Sneakers
          </Text>
        </View>
        <Text className="font-RalewayBold text-xl text-gray-900">₦23,000</Text>
      </View>

      {/* Shipping Options */}
      <Text className="text-xl font-RalewayBold mb-2 ">Shipping Options</Text>

      <TouchableOpacity
        onPress={() => setShipping("standard")}
        className={`flex-row justify-between items-center p-4 font-NunitoRegular rounded-2xl mb-2 ${
          shipping === "standard"
            ? "bg-blue-50 border border-blue-500"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={
              shipping === "standard" ? "radio-button-on" : "radio-button-off"
            }
            size={20}
            color={shipping === "standard" ? "#004CFF" : "#9CA3AF"}
          />
          <Text className="ml-2 text-gray-800 font-RalewaySemiBold">
            Standard
          </Text>
        </View>
        <Text className="text-gray-800 font-RalewaySemiBold">FREE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShipping("express")}
        className={`flex-row justify-between items-center font-NunitoRegular p-4 rounded-2xl mb-2 ${
          shipping === "express"
            ? "bg-blue-50 border border-blue-500"
            : "bg-gray-50 border border-gray-200"
        }`}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={
              shipping === "express" ? "radio-button-on" : "radio-button-off"
            }
            size={20}
            color={shipping === "express" ? "#004CFF" : "#9CA3AF"}
          />
          <Text className="ml-2 text-gray-800 font-RalewaySemiBold">
            Express
          </Text>
        </View>
        <Text className="text-gray-800 font-semibold font-RalewaySemiBold">
          ₦5000
        </Text>
      </TouchableOpacity>
      {/* 
      <Text className="text-gray-500 text-sm mb-6 font-NunitoLight">
        Delivered on or before Thursday, 23 April 2020
      </Text> */}

      {/* Payment Method */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-xl font-RalewayBold">Payment Method</Text>
        {/* <TouchableOpacity className="bg-primary-50 mt-2 rounded-full p-2">
          <Feather name="edit-2" size={20} color="white" />
          </TouchableOpacity> */}
      </View>

      <TouchableOpacity className="bg-blue-50 px-4 py-3 rounded-full self-start mb-10">
        <Text className="text-blue-600 font-NunitoMedium">PayStack</Text>
      </TouchableOpacity>

      {/* Total + Pay */}
      <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl mb-36">
        <View>
          <Text className="text-gray-500 font-NunitoBold">Total</Text>
          <Text className="text-2xl font-RalewaySemiBold text-gray-900">
            ₦{totalAmount.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={initiatePayment}
          className="bg-blue-600 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-NunitoBold text-base">Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Paystack WebView */}
      {showPaystack && (
        <Paystack
          paystackKey="pk_test_9990c0d10bc97f2bb1c6bb9825c260d07e24ebe1" // replace with your test key
          amount={totalAmount}
          billingEmail="amandamorgan@example.com"
          activityIndicatorColor="blue"
          onCancel={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          autoStart={true}
          // ref={paystackWebViewRef}
        />
      )}
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#1E90FF" />
            <Text className="font-RalewayBold text-xl" style={styles.loaderTitle}>Payment is in progress</Text>
            <Text className="font-NunitoRegular text-lg" style={styles.loaderSub}>Please, wait a few moments</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loaderBox: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderTitle: { marginTop: 15,  color: "#333" },
  loaderSub: { marginTop: 5, color: "#666" },
});