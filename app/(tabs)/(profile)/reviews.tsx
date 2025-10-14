import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const reviews = [
  {
    id: "1",
    name: "Great Food and Service",
    rating: 5,
    date: "20/12/2020",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
  {
    id: "2",
    name: "Awesome and Nice",
    rating: 4,
    date: "20/12/2020",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
  },
  {
    id: "3",
    name: "Good but could be better",
    rating: 3,
    date: "20/12/2020",
    comment:
      "Nice overall experience but delivery took longer than expected.",
  },
  {
    id: "4",
    name: "Excellent Taste!",
    rating: 5,
    date: "20/12/2020",
    comment:
      "Perfectly cooked and flavorful, will definitely order again.",
  },
];

const ReviewCard = ({ item }:any) => {
  return (
    <View className="flex-row mb-4">
      {/* Avatar */}
      <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />

      {/* Review Content */}
      <View className="flex-1 bg-gray-50 rounded-2xl p-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-400 font-NunitoMedium text-xs">{item.date}</Text>
          <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
        </View>

        <Text className="text-gray-900  text-lg mb-1 font-RalewayBold">
          {item.name}
        </Text>

        {/* Stars */}
        <View className="flex-row mb-2">
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < item.rating ? "star" : "star-outline"}
              size={16}
              color="#007BFF"
            />
          ))}
        </View>

        <Text className="text-gray-600 font-NunitoLight text-base leading-5">{item.comment}</Text>
      </View>
    </View>
  );
};

const ReviewsScreen = () => {
  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center mt-10 mb-5 p-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 p-2 rounded-full mr-3"
        >
           <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-RalewayBold text-gray-800">Reviews</Text>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReviewCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ReviewsScreen;
