import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { SearchComponent } from "components/SearchInput";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Electronics from "../../../assets/icons/Electronics.svg";
import Fashion from "../../../assets/icons/Fashion.svg";
import Drugs from "../../../assets/icons/tablets.svg";
import AutoMobile from "../../../assets/icons/AutoMobile.svg";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
const Data = [
  {
    id: "1",
    name: "Electronics",
    image: <Electronics width={25} height={25} />,
  },
  { id: "3", name: "AutoMobile", image: <AutoMobile width={25} height={25} /> },
  { id: "4", name: "Drugs", image: <Drugs width={25} height={25} /> },
  { id: "2", name: "Fashion", image: <Fashion width={25} height={25} /> },
];
const index = () => {
  return (
    <SafeAreaView className="flex-1 flex p-5 bg-white">
      <View className="flex-row items-center mt-8 justify-between">
        <View className="w-[75%]">
          <View className="flex-row items-center">
            <Text className="text-2xl  font-RalewayBold text-textColor-100">
              Deliver to
            </Text>
            <FontAwesome6 name="chevron-down" size={18} color="#000" />
          </View>
          <Text className="text-base font-NunitoMedium  w-[80%] text-primary-100">
            Lekki, Sangotendo Ajah, Lekki-Epe Expressway Lagos Nigeria{" "}
          </Text>
        </View>

        <View className="flex-row w-[45%] items-center gap-3">
          <TouchableOpacity className="px-2 py-2 bg-[#F3F4F6] rounded-full">
            <FontAwesome name="bell" size={24} color="#004CFF" />
          </TouchableOpacity>
          <Image
            source={require("../../../assets/images/artist-2 1.png")}
            style={{ width: 40, height: 40, borderRadius: 999 }}
          />
        </View>
      </View>
      <View className="mt-8">
        <SearchComponent placeholder="Search" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mt-5">
        <View className="mt-8 flex-row justify-between items-center">
          <Text className="text-xl font-NunitoMedium text-textColor-100">
            Shop by Category
          </Text>
          <TouchableOpacity onPress={()=>router.push({pathname: "/(tabs)/(home)/category", params: {category: "Category"}})} className="flex-row items-center gap-1">
            <Text className="text-lg font-NunitoBold text-primary-100">
              View All
            </Text>
            {/* <FontAwesome6 name="arrow-right-long" size={18} color="#004CFF" /> */}
            <MaterialIcons name="arrow-forward-ios" size={18} color="#004CFF" />
          </TouchableOpacity>
        </View>
        <View className="mt-8 flex-row flex-wrap  justify-between" >
          {Data.map((item) => (
            <TouchableOpacity
            onPress={()=>router.push({pathname: "/(tabs)/(home)/category", params: {category: item.name}})}
              key={item.id}
              className="w-[32%] flex-row bg-primary-100/20 items-center p-2 rounded-lg mb-3"
            >
              {item.image}
              <Text className="text-base font-NunitoMedium text-primary-100 ml-1">
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ads  */}

        {/* Popular Selling */}
        <View>
          <View className="mt-8 flex-row justify-between items-center">
            <Text className="text-xl font-NunitoMedium text-textColor-100">
              Popular Selling
            </Text>
            <TouchableOpacity onPress={()=>router.push({pathname: "/(tabs)/(home)/listings", params: {route: "Selling"}})} className="flex-row items-center gap-1">
              <Text className="text-lg font-NunitoBold text-primary-100">
                View All
              </Text>
              {/* <FontAwesome6 name="arrow-right-long" size={18} color="#004CFF" /> */}
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color="#004CFF"
              />
            </TouchableOpacity>
          </View>

             {/* List of Popular Selling Items */}
          <View className="flex flex-row flex-wrap justify-between gap-1">
            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border border-primary-100 rounded-lg">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-1 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-1 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className="relative p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold flex flex-row justify-center items-center">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
              <View className="bg-primary-100 p-2 rounded-b-lg absolute top-4 right-2">
                <Text className="text-white font-NunitoLight">Verified ID</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border rounded-lg border-primary-100">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-2 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-2 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className=" p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold ">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border border-primary-100 rounded-lg">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-1 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-1 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className="relative p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold flex flex-row justify-center items-center">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
              <View className="bg-primary-100 p-2 rounded-b-lg absolute top-4 right-2">
                <Text className="text-white font-NunitoLight">Verified ID</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border rounded-lg border-primary-100">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-2 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-2 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className=" p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold ">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
  
          </View>
         
        </View>

        {/* New Listing */}
        <View>
            <View className="mt-8 flex-row justify-between items-center">
            <Text className="text-xl font-NunitoMedium text-textColor-100">
              New Listing
            </Text>
            <TouchableOpacity onPress={()=>router.push({pathname: "/(tabs)/(home)/listings", params: {route: "Listings"}})} className="flex-row items-center gap-1">
              <Text className="text-lg font-NunitoBold text-primary-100">
                View All
              </Text>
              {/* <FontAwesome6 name="arrow-right-long" size={18} color="#004CFF" /> */}
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color="#004CFF"
              />
            </TouchableOpacity>
          </View>
          <View className="flex flex-row flex-wrap justify-between gap-1">
            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border border-primary-100 rounded-lg">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-1 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-1 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className="relative p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold flex flex-row justify-center items-center">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
              <View className="bg-primary-100 p-2 rounded-b-lg absolute top-4 right-2">
                <Text className="text-white font-NunitoLight">Verified ID</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>router.push("/(tabs)/(home)/details")} className="mt-5 w-[49%] border rounded-lg border-primary-100">
              <Image
                source={require("../../../assets/images/sneaker.png")}
                className=" w-full h-40 rounded-lg border-4 border-white shadow-2xl"
              />
              <View>
                <View className="p-2 flex-row justify-between items-start">
                  <Text className="text-2xl font-NunitoRegular text-textColor-100 mt-2">
                    Nike Sneaker
                  </Text>
                  <TouchableOpacity className="flex-row px-2 py-1.5 rounded-full bg-primary-100 justify-between items-center mt-1">
                    <FontAwesome6 name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-[30px] p-2 font-RalewayExtraBold text-textColor-100 ">
                  ₦17,000
                </Text>

                <View className=" p-2 mt-2 mb-5">
                  <Text className="bg-primary-100/20 text-lg rounded-lg text-primary-100 p-2 font-NunitoSemiBold ">
                    Brand New
                  </Text>
                  <Text className="font-NunitoMedium text-lg">
                    Lagos Nigeria
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
  
          </View>
          </View>
      </ScrollView>

      {/* rest of home screen content */}
    </SafeAreaView>
  );
};

export default index;
