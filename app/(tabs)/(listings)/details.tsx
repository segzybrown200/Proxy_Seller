import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function ListDetailsScreen() {
  const [images] = useState([
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  ]);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row mt-10 justify-between items-center p-5">
        <TouchableOpacity className="bg-[#ECF0F4] p-2 rounded-full">
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-RalewayBold">List Details</Text>
        <TouchableOpacity onPress={()=>router.push("/(tabs)/(listings)/edit-listings")}>
          <Text className="text-[#004CFF] font-RalewayBold text-lg">EDIT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative  items-center mt-2">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width,
                  height: 220,
                  resizeMode: "cover",
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-3 flex-row self-center">
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 mx-1 rounded-full ${
                  index === activeIndex ? "bg-[#004CFF]" : "bg-gray-300"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Item Info */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-RalewayBold">Sneaker</Text>
            <Text className="text-2xl font-RalewayBold">₦6000</Text>
          </View>
          <View className="flex-row items-center mt-5">
            <Entypo name="location-pin" size={16} color="gray" />
            <Text className="text-gray-500 font-NunitoSemiBold text-lg">Lekki</Text>
            <View className="flex-row items-center ml-3">
              <Ionicons name="star" size={16} color="#004CFF" />
              <Text className="ml-1 text-[#004CFF] font-NunitoBold text-lg">4.9</Text>
              <Text className="text-gray-400 font-NunitoRegular text-base ml-1">(10 Reviews)</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Item Details */}
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Condition</Text>
              <Text className="font-NunitoBold text-lg mt-1">Used</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Listing Type</Text>
              <Text className="font-NunitoBold text-lg  mt-1">Physical</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Quantity</Text>
              <Text className="font-NunitoBold text-lg  mt-1">30</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Category</Text>
              <Text className="font-NunitoBold text-lg  mt-1">Sport</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Gender</Text>
              <Text className="font-NunitoBold text-lg  mt-1">Male</Text>
            </View>
            <View className="w-[33%]" />
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Description */}
          <View className="pb-10">
            <Text className="text-gray-400 text-base font-RalewayMedium mb-2">Description</Text>
            <Text className="text-gray-600 text-lg font-NunitoLight leading-5">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Blandit
              vel mattis et amet dui mauris turpis.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
