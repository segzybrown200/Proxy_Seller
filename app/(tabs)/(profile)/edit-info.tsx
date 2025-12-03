import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Alert, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updateUserState } from "global/authSlice";
import { updateVendor } from "../../../api/api";

export default function EditProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser) as any;
  console.log(user)
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.user?.name || "");
  const [email, setEmail] = useState(user?.user?.email || "");
  const [phone, setPhone] = useState(user?.user?.phone || "");
  const [profileImage, setProfileImage] = useState(require("../../../assets/images/artist-2 2.png"));



  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold">Edit Profile</Text>
      </View>

      {/* Profile Picture */}
      <View className="items-center mt-10 relative">
        <TouchableOpacity >
          <Image source={profileImage} className="w-32 h-32 rounded-full" />
          {/* <View className="absolute bottom-2 right-2 bg-[#004CFF] rounded-full p-2">
            <Ionicons name="pencil" size={16} color="white" />
          </View> */}
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View className="mt-10">
        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">FULL NAME</Text>
        <TextInput
          className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">EMAIL</Text>
        <TextInput
          className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">PHONE NUMBER</Text>
        <TextInput
          className="bg-[#F1F5F9] rounded-xl p-4 font-NunitoRegular"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={async () => {
          try {
            setLoading(true);
            const token = user?.token;
            if (!token) {
              Alert.alert("Error", "You need to be logged in to update your profile");
              return;
            }

            // Only send fields that changed
            const updates: any = {};
            if (name !== user?.user?.name) updates.name = name;
            if (email !== user?.user?.email) updates.email = email;
            if (phone !== user?.user?.phone) updates.phone = phone;

            if (Object.keys(updates).length === 0) {
              router.back();
              return;
            }

            const result = await updateVendor(updates, token)
            // Update Redux store with the new user data
            dispatch(updateUserState(updates));
            Alert.alert("Success", "Profile updated successfully");
            router.back();
          } catch (error: any) {
            console.log(error)
            const message = error?.message || 'Failed to update profile';
            Alert.alert("Error", message);
          } finally {
            setLoading(false);
          }
        }}
        className="mt-16 bg-[#004CFF] rounded-xl py-4"
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center text-white text-base font-NunitoBold">SAVE</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
