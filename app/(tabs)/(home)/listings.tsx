import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image
} from "react-native";
import { TextInput } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Dashboard from "../../../assets/icons/Dashboard.svg";
import { SearchComponent } from "../../../components/SearchInput";
import Filter from "../../../assets/icons/filter.svg";
import Electronic from "../../../assets/icons/Electronics.svg";
import Fashion from "../../../assets/icons/Fashion.svg";
import Services from "../../../assets/icons/handshake 1.svg";
import Automobile from "../../../assets/icons/AutoMobile.svg";
import Drugs from "../../../assets/icons/tablets.svg";
import Beauty from "../../../assets/icons/Beauty blog.svg";
import { router, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

const Data1 = [
  {
    id: "1",
    name: "Electronics",
    image: <Electronic width={25} height={25} />,
  },
  { id: "3", name: "AutoMobile", image: <Automobile width={25} height={25} /> },
  { id: "4", name: "Drugs", image: <Drugs width={25} height={25} /> },
  { id: "2", name: "Fashion", image: <Fashion width={25} height={25} /> },
  { id: "5", name: "Beauty", image: <Beauty width={25} height={25} /> },
  { id: "6", name: "Services", image: <Services width={25} height={25} /> },
];
const categories = [
  "Fashion",
  "Electronics",
  "Home",
  "Beauty",
  "Sports",
  "Toys",
  "Books",
];
const condition = ["Brand New", "Used", "Refurbuished"];

const listings = () => {
    const {route} = useLocalSearchParams()
  const [isVisible, setIsVisible] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<string[]>([]);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(200);
  const [maxDistance, setMaxDistance] = useState("");

  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      // unselect
      setSelected(selected.filter((c) => c !== category));
    } else {
      // select
      setSelected([...selected, category]);
    }
  };
  const toggleCondition = (condition: string) => {
    if (selectedCondition.includes(condition)) {
      // unselect
      setSelectedCondition(selectedCondition.filter((c) => c !== condition));
    } else {
      // select
      setSelectedCondition([...selectedCondition, condition]);
    }
  };
  const resetAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelected([]);
    setSelectedCondition([]);
    setLow(0);
    setHigh(200);
    setMaxDistance("");
    setIsVisible(false);
  };
  return (
    <SafeAreaView className="flex-1 bg-[#sF9FAFB] p-4">
      <View className=" mt-5 flex flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(home)")}
          className="rounded-full bg-primary-100 p-2"
        >
          <Dashboard width={20} height={20} />
        </TouchableOpacity>
        <Text className="font-RalewayBold text-3xl">{route === "Listings" ? "New Listings" : "Popular Selling"}</Text>
      </View>

      <View className="mt-5 flex  flex-row items-center">
        <SearchComponent
          placeholder="Search......"
          otherStyles={"flex-1"}
          white="yes"
        />
        <TouchableOpacity
          className="ml-3 rounded-md bg-primary-100 p-2"
          onPress={() => setIsVisible(true)}
        >
          <Filter width={30} height={30} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <View className="max-h-min w-full bg-white p-4">
              <View className="flex flex-row items-center justify-between">
                <Text className="font-RalewaySemiBold text-lg text-primary-100">
                  Cancel
                </Text>
                <Text className="font-RalewaySemiBold text-lg text-textColor-50">
                  Filter
                </Text>
                <TouchableOpacity onPress={resetAll}>
                  <Text className="font-RalewaySemiBold text-lg text-primary-100">
                    Reset All
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Price Range */}
              <View className="mt-5">
                <Text className="mb-2 font-RalewaySemiBold text-xl">
                  Price Range
                </Text>
                <View className="flex flex-row items-center justify-between">
                  <TextInput
                    className="w-[48%] rounded-lg bg-[#F6F6F6] p-3 font-NunitoRegular"
                    placeholder="Min Price"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <TextInput
                    className="w-[48%] rounded-lg bg-[#F6F6F6] p-3 font-NunitoRegular"
                    placeholder="Max Price"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* Category */}
              <View className="mt-5">
                <Text className="mb-2 font-RalewaySemiBold text-xl">
                  Category
                </Text>
                {/* Selet Category */}
                <View className="flex flex-row flex-wrap items-center gap-3">
                  {categories.map((cat, index) => {
                    const isSelected = selected.includes(cat);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleCategory(cat)}
                        className={`flex flex-row items-center gap-2 rounded-lg  p-2 
                      ${isSelected ? " bg-primary-100" : "bg-primary-400"}
                      `}
                      >
                        <Text
                          className={`${isSelected ? "font-NunitoSemiBold text-white" : "font-NunitoSemiBold text-primary-100"}`}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Condition */}
              <View className="mt-5">
                <Text className="mb-2 font-RalewaySemiBold text-xl">
                  Condition
                </Text>
                {/* Selet Category */}
                <View className="flex flex-row flex-wrap items-center gap-3">
                  {condition.map((con, index) => {
                    const isSelectedCondition = selectedCondition.includes(con);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleCondition(con)}
                        className={`flex flex-row items-center gap-2 rounded-lg  p-2 
                      ${isSelectedCondition ? " bg-primary-100" : "bg-primary-400"}
                      `}
                      >
                        <Text
                          className={`${isSelectedCondition ? "font-NunitoSemiBold text-white" : "font-NunitoSemiBold text-primary-100"}`}
                        >
                          {con}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Location Range */}
              <View className="mt-5">
                <Text className="mb-2 font-RalewaySemiBold text-xl">
                  Location Range (km)
                </Text>
                <View className="mb-4 flex flex-row items-center justify-between">
                  {/* Min distance - disabled */}
                  <TextInput
                    className="w-[48%] rounded-lg bg-[#F6F6F6] p-3 font-NunitoRegular text-gray-400"
                    placeholder="Min km"
                    value={"0"}
                    editable={false}
                  />
                  {/* Max distance - editable */}
                  <TextInput
                    className="w-[48%] rounded-lg bg-[#F6F6F6] p-3 font-NunitoRegular"
                    placeholder="Max km"
                    keyboardType="numeric"
                    value={maxDistance}
                    onChangeText={setMaxDistance}
                  />
                </View>
              </View>

              {/* Reset / Apply row */}
              <View className="mt-4 flex-row  items-center justify-center">
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  className="px-4 py-2 rounded-lg bg-primary-100"
                >
                  <Text className="text-white font-NunitoBold text-lg">
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


      <View className="mt-8 flex-row flex-wrap  justify-between">
        {Data1.map((item) => (
          <View
            key={item.id}
            className="w-[32%] flex-row bg-primary-100/20 items-center p-2 rounded-lg mb-3"
          >
            {item.image}
            <Text className="text-base font-NunitoMedium text-primary-100 ml-1">
              {item.name}
            </Text>
          </View>
        ))}
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
    </SafeAreaView>
  );
};

export default listings;
