import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Dashboard from "../../../assets/icons/Dashboard.svg";
import { SearchComponent } from "../../../components/SearchInput";
import { router } from "expo-router";

const listings = () => {
  const physicalListings = [
    {
      id: 1,
      title: "Nike Air Zoom Sneakers",
      description: "Comfortable sports sneakers for everyday use.",
      price: "₦85,000",
      image: require("../../../assets/images/sneaker.png"), // Example image
      status: "Live",
    },
    {
      id: 2,
      title: "Wireless Headphones",
      description: "High-quality Bluetooth headphones with long battery life.",
      price: "₦45,000",
      image: require("../../../assets/images/sneaker.png"),
      status: "Live",
    },
  ];

  const digitalListings = [
    {
      id: 1,
      title: "UI/UX Design eBook",
      description: "A complete guide to designing a mobile app from scratch.",
      price: "₦15,000",
      fileType: "PDF",
      status: "Live",
    },
    {
      id: 2,
      title: "Photography Masterclass",
      description:
        "Learn professional photography skills from industry experts.",
      price: "₦22,000",
      fileType: "Video Course",
      status: "Draft",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB] p-4">
      {/* Header */}
      <View className="mt-5 flex flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(home)")}
          className="rounded-full bg-primary-100 p-2"
        >
          <Dashboard width={20} height={20} />
        </TouchableOpacity>
        <Text className="font-RalewayBold text-3xl">My Listings</Text>
      </View>

      {/* Search */}
      <View className="mt-5 flex flex-row items-center">
        <SearchComponent placeholder="Search......" otherStyles={"flex-1"} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-5 space-y-8"
      >
        {/* PHYSICAL LISTINGS */}
        <View>
          <Text className="font-NunitoSemiBold text-lg mb-4">
            Physical Listings
          </Text>
          {physicalListings.map((item) => (
            <TouchableOpacity
            onPress={()=>router.push("/(tabs)/(listings)/details")}
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-NunitoBold text-xl">{item.title}</Text>
                <Text
                  className={`font-NunitoBold text-base ${
                    item.status === "Live"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {item.status}
                </Text>
              </View>

              <Image
                source={ item.image }
                className="w-full h-40 rounded-xl mb-3"
                resizeMode="cover"
              />

              <Text className="font-NunitoRegular text-gray-500 mb-3">
                {item.description}
              </Text>

              <View className="flex-row justify-between items-center">
                <Text className="font-NunitoBold text-lg">{item.price}</Text>
                <TouchableOpacity className="bg-primary-100 px-4 py-2 rounded-lg">
                  <Text className="font-NunitoSemiBold text-white">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DIGITAL LISTINGS */}
        <View>
          <Text className="font-NunitoSemiBold text-lg mb-4">
            Digital Listings
          </Text>
          {digitalListings.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-NunitoBold text-xl">{item.title}</Text>
                <Text
                  className={`font-NunitoBold text-base ${
                    item.status === "Live"
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                >
                  {item.status}
                </Text>
              </View>

              <Text className="font-NunitoRegular text-gray-500 mb-3">
                {item.description}
              </Text>

              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-NunitoBold text-lg">{item.price}</Text>
                  <Text className="font-NunitoSemiBold text-sm text-gray-400">
                    {item.fileType}
                  </Text>
                </View>
                <TouchableOpacity className="bg-primary-100 px-4 py-2 rounded-lg">
                  <Text className="font-NunitoSemiBold text-white">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default listings;
