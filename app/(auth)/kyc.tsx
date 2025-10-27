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
import { router, useLocalSearchParams } from "expo-router";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormFields";
import { showError, showSuccess } from "utils/toast";
import { UploadKYC } from "api/api";

const KYCScreen = () => {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [nin, setNin] = useState<string>("");
  const [ninError, setNinError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, email, phone, vendorId } = useLocalSearchParams();


  const pickImage = async (type: "id" | "selfie") => {
    try {
      if (type === "id") {
        // Request permission for gallery
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "Please allow photo access to upload your ID."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });

        if (!result.canceled) {
          const compressed = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 1500 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          setIdImage(compressed.uri);
        }
      } else {
        // Request permission for camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "Please allow camera access to take your selfie."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled) {
          const compressed = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [{ resize: { width: 1200 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
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
    setLoading(true);
    // Validate NIN: exactly 11 numeric digits
    const ninDigitsOnly = nin.replace(/\D/g, "");
    if (ninDigitsOnly.length !== 11) {
      setLoading(false);
      setNinError("NIN must be exactly 11 digits.");
      return;
    }
    setNinError(null);

    if (!idImage || !selfie) {
      setLoading(false);
      showError("Please upload both ID and selfie before submitting.");
      return;
    }

    // Helper to create a proper file object for FormData
    const makeFileObject = (uri: string, fallbackName: string) => {
      const parts = uri.split('/');
      const rawName = parts[parts.length - 1] || fallbackName;
      const match = /\.(\w+)$/.exec(rawName);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = ext === 'png' ? `image/png` : `image/jpeg`;
      const name = rawName.includes('.') ? rawName : `${fallbackName}.${ext}`;
      return { uri, name, type } as any;
    };

    const formData = new FormData();
    // Append digits-only NIN to payload
    formData.append('nin', ninDigitsOnly);

    // Append files with uri/name/type so backend and fetch/XHR can detect them
    formData.append('selfie', makeFileObject(selfie as string, 'selfie'));
    formData.append('idCard', makeFileObject(idImage as string, 'idCard'));

      await UploadKYC(formData, token as string)
      .then(() => {
        setLoading(false)
        showSuccess('KYC submitted successfully!');
      setIdImage(null);
      setSelfie(null);
      setNin('');
      router.replace({ pathname: '/(auth)/location', params: { email: email, phone: phone, vendorId: vendorId } });
      }).catch((error) => {
        console.log(error)
        setLoading(false)
        showError(error?.message);
      });
     
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="absolute">
        <Image source={require("../../assets/images/Bubbles.png")} />
      </View>

      <TouchableOpacity
        className="mb-6 mt-14 p-5"
        onPress={() => router.back()}
      >
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

      {/* NIN Input */}
      <View className="mb-6 px-5">
        <Text className="text-lg font-NunitoLight mb-2 text-gray-700">
          National Identification Number (NIN)
        </Text>
        <FormField
          title="NIN"
          placeholder="Enter your 11-digit NIN"
          value={nin}
          handleChangeText={(text: string) => {
            // Allow only digits in input state
            const digitsOnly = text.replace(/\D/g, "");
            setNin(digitsOnly);
            if (ninError) setNinError(null);
          }}
          otherStyles=""
        />
        {ninError && (
          <Text className="text-red-500 font-NunitoLight text-[13px] mt-[10px]">
            {ninError}
          </Text>
        )}
        <Text className="text-gray-400 text-[13px] mt-2">
          NIN must be exactly 11 numeric digits.
        </Text>
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
