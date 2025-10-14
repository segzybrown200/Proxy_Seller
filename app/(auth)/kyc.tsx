import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CustomButton from "../../components/CustomButton";

const KYCScreen = () => {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (type: "id" | "selfie") => {
    try {
      if (type === "id") {
        // Request permission for gallery
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Please allow photo access to upload your ID.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled) {
          const compressed = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 1000 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          setIdImage(compressed.uri);
        }
      } else {
        // Request permission for camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Please allow camera access to take your selfie.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled) {
          const compressed = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 800 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
          );
          setSelfie(compressed.uri);
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to open image picker.");
    }
  };

  const handleSubmit = async () => {
    if (!idImage || !selfie) {
      Alert.alert("Incomplete", "Please upload both ID and selfie before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      Alert.alert("Submitted", "Your KYC verification has been submitted successfully!");
      setIdImage(null);
      setSelfie(null);
      router.push("/(auth)/verifyOptions");
    } catch {
      Alert.alert("Error", "Something went wrong while submitting your KYC.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="absolute">
        <Image source={require("../../assets/images/Bubbles.png")} />
      </View>

      <TouchableOpacity className="mb-6 mt-14 p-5" onPress={() => router.back()}>
        <FontAwesome6 name="arrow-left-long" size={25} color="black" />
      </TouchableOpacity>

      <Text className="text-2xl font-RalewaySemiBold mb-6 text-gray-800 px-5">
        KYC Verification
      </Text>

      {/* Upload ID */}
      <View className="mb-6 px-5">
        <Text className="text-lg font-NunitoLight mb-2 text-gray-700">
          Upload Valid ID (National ID, Passport, etc.)
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => pickImage("id")}
          className="bg-gray-100 h-44 rounded-2xl justify-center items-center border border-gray-300"
        >
          {idImage ? (
            <Image
              source={{ uri: idImage }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="cloud-upload-outline" size={40} color="#888" />
              <Text className="text-gray-500 mt-2 font-NunitoLight">
                Tap to upload ID
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Take Selfie */}
      <View className="mb-6 px-5">
        <Text className="text-lg font-NunitoLight mb-2 text-gray-700">
          Take a Selfie for Verification
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => pickImage("selfie")}
          className="bg-gray-100 h-44 rounded-2xl justify-center items-center border border-gray-300"
        >
          {selfie ? (
            <Image
              source={{ uri: selfie }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="camera-outline" size={40} color="#888" />
              <Text className="text-gray-500 mt-2 font-NunitoLight">
                Tap to take selfie
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <View className="px-5 mb-10">
        <CustomButton
          title="Submit for Verification"
          handlePress1={handleSubmit}
          isLoading={loading}
        />
      </View>
    </ScrollView>
  );
};

export default KYCScreen;
