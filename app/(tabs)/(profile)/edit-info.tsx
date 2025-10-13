import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";

export default function EditProfileScreen() {
  const [name, setName] = useState("Segun");
  const [email, setEmail] = useState("segun@gmail.com");
  const [phone, setPhone] = useState("+234 704 260 4550");
  const [profileImage, setProfileImage] = useState(require("../../../assets/images/artist-2 2.png"));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      let uri = result.assets[0].uri;
      let fileInfo = await FileSystem.getInfoAsync(uri);
      let sizeKB = fileInfo.exists && fileInfo.size ? fileInfo.size / 1024 : 0;

      // If image > 10KB, reduce size iteratively
      if (sizeKB > 10) {
        let compressed = uri;
        let quality = 0.9;
        let width = 300;

        // Reduce quality or resize until size < 10KB or quality < 0.1
        while (sizeKB > 10 && quality > 0.1) {
          const manipulated = await ImageManipulator.manipulateAsync(
            compressed,
            [{ resize: { width } }],
            { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
          );
          const newInfo = await FileSystem.getInfoAsync(manipulated.uri);
          sizeKB = newInfo.exists && newInfo.size ? newInfo.size / 1024 : 0;
          compressed = manipulated.uri;

          // Adjust next iteration
          quality -= 0.1;
          width -= 30;
        }

        if (sizeKB <= 10) {
          setProfileImage({ uri: compressed });
        } else {
          Alert.alert("Image Too Large", "Could not compress image below 10KB.");
        }
      } else {
        setProfileImage({ uri });
      }
    }
  };

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
        <TouchableOpacity onPress={pickImage}>
          <Image source={profileImage} className="w-32 h-32 rounded-full" />
          <View className="absolute bottom-2 right-2 bg-[#004CFF] rounded-full p-2">
            <Ionicons name="pencil" size={16} color="white" />
          </View>
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
        onPress={() => router.back()}
        className="mt-16 bg-[#004CFF] rounded-xl py-4"
      >
        <Text className="text-center text-white text-base font-NunitoBold">SAVE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
