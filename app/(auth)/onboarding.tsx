import React, { useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Octicons from "@expo/vector-icons/Octicons";
import CustomButton from "../../components/CustomButton";

const SellerOnboarding = () => {
  const videoRef = useRef<any>(null);
  const [videoReady, setVideoReady] = React.useState(false);

  const player = useVideoPlayer(
    require("../../assets/Proxy_Seller.mp4"),
    (player) => {
      player.loop = true;
      // attempt to mute the player for background playback
      try {
        if (typeof (player as any).setIsMuted === "function") {
          (player as any).setIsMuted(true);
        } else if ("muted" in player) {
          (player as any).muted = true;
        } else if (typeof (player as any).setVolume === "function") {
          (player as any).setVolume(0);
        }
      } catch (e) {
        // ignore if mute isn't supported
      }

      // Set video as ready once player initializes
      setVideoReady(true);
      player.play();
    }
  );

  return (
    <View style={styles.container}>
      {/* Background video (fills entire screen) */}
      <VideoView
        ref={videoRef}
        player={player}
        style={StyleSheet.absoluteFill as ViewStyle}
        nativeControls={false}
        contentFit="fill"
      />

      {/* show loader until video buffers */}
      {!videoReady && (
        <View style={StyleSheet.absoluteFill}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Dim overlay for readability */}
      <View style={styles.overlay} pointerEvents="none" />

      <SafeAreaView className="flex-1 px-6 pt-6" style={styles.safeArea}>
        {/* Top Logo */}
        <View className="flex flex-row justify-between items-center">
          <Image
            source={require("../../assets/images/Proxy Logo 2.png")}
            className="w-28 h-28"
            resizeMode="contain"
          />
        </View>

        {/* Hero Section (content over video) */}
        <View className="flex-1 justify-center items-center">
          <View className="w-full h-80 rounded-lg overflow-hidden bg-transparent" />

          <Text className="text-3xl font-NunitoLight text-center text-white mt-6">
            Start Selling Effortlessly
          </Text>

          <Text className="text-lg text-center text-white font-NunitoLight mt-2 w-[80%]">
            Create your store, upload your items, and reach more buyers nearby.
          </Text>
        </View>

        {/* Bottom Buttons */}
        <View className="mb-16">
          <CustomButton
            title="Get Started"
            handlePress={() => router.push("/(auth)/register")}
          />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            className="flex flex-row justify-center items-center mt-6"
          >
            <Text className="text-lg font-NunitoLight text-white">
              I already have an account
            </Text>
            <View className="px-2 py-1 ml-2 bg-primary-100 rounded-full">
              <Octicons name="arrow-right" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});

export default SellerOnboarding;
