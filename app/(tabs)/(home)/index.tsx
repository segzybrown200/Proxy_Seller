import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const SellerDashboard = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB] p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-10">
        <TouchableOpacity className="bg-white shadow-sm p-4 rounded-full">
          <FontAwesome6 name="bars" size={22} color="#004CFF" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-RalewaySemiBold text-[#004CFF] uppercase">
            Location
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-NunitoBold text-gray-800">
              Halal Lab office
            </Text>
            <FontAwesome6 name="chevron-down" size={14} color="#000" />
          </View>
        </View>

        <Image
          source={require("../../../assets/images/artist-2 2.png")}
          className="w-14 h-14 rounded-full"
          resizeMode="cover"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-6"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Order Stats */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-6xl font-RalewayExtraBold text-gray-900">
              20
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              Running Orders
            </Text>
          </View>

          <View className="bg-white w-[48%] py-5 rounded-2xl shadow-sm items-center">
            <Text className="text-6xl font-RalewayExtraBold text-gray-900">
              05
            </Text>
            <Text className="text-base font-NunitoMedium text-gray-500">
              Order Request
            </Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View className="bg-white p-5 rounded-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-base font-RalewaySemiBold text-gray-500">
                Total Revenue
              </Text>
              <Text className="text-3xl font-RalewayExtraBold text-gray-900">
                ₦220,241
              </Text>
            </View>

            <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-1">
              <Text className="font-NunitoMedium text-gray-600">Daily</Text>
            </TouchableOpacity>
          </View>

          <LineChart
            data={{
              labels: ["10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM"],
              datasets: [
                {
                  data: [10000, 30000, 50000, 35000, 40000, 45000, 60000],
                },
              ],
            }}
            width={screenWidth - 70}
            height={180}
            yAxisLabel="₦"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 76, 255, ${opacity})`,
              labelColor: () => "#004CFF",
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#004CFF",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
              
            }}
          />
          <TouchableOpacity className="mt-2">
            <Text className="text-[#004CFF] text-right font-NunitoSemiBold">
              See Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        <View className="bg-white mt-6 p-5 rounded-2xl shadow-sm flex-row justify-between items-center">
          <View>
            <Text className="text-base font-NunitoSemiBold text-gray-700">
              Reviews
            </Text>
            <View className="flex-row items-center mt-1">
              <FontAwesome name="star" size={20} color="#004CFF" />
              <Text className="ml-2 text-xl font-NunitoBold text-[#004CFF]">
                4.9
              </Text>
              <Text className="ml-1 text-gray-500 font-NunitoMedium">
                Total 20 Reviews
              </Text>
            </View>
          </View>

          <TouchableOpacity>
            <Text className="text-[#004CFF] font-NunitoSemiBold">
              See All Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Items */}
        <View className="mt-6 bg-white p-5 rounded-2xl shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-NunitoSemiBold text-gray-700">
              Popular Items This Week
            </Text>
            <TouchableOpacity>
              <Text className="text-[#004CFF] font-NunitoSemiBold">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <Image
              source={require("../../../assets/images/sneaker.png")}
              className="w-[48%] h-32 rounded-2xl"
              resizeMode="cover"
            />
            <Image
              source={require("../../../assets/images/sneaker.png")}
              className="w-[48%] h-32 rounded-2xl"
              resizeMode="cover"
            />
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellerDashboard;
