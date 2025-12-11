import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import Dashboard from "../../../assets/icons/Dashboard.svg";
import { SearchComponent } from "../../../components/SearchInput";
import { router } from "expo-router";
import { useListings } from "hooks/useHooks";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";

const listings = () => {
    const user:any = useSelector(selectUser)
    const token = user?.token || ''
  const { listings, isLoading, isError, mutate } = useListings(token)

  // console.log(listings?.data[0])


  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof mutate === 'function') await mutate();
      else await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.warn('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [mutate]);

  // Function to format price to Naira
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  const transformListings = (data: any[]) => {
    if (!data) return { physical: [], digital: [] }
    
    return data.reduce((acc: { physical: any[], digital: any[] }, item: any) => {
      const transformedItem = {
        id: item.id,
        title: item.title,
        description: item.description,
        price: formatPrice(item.price),
        priceRaw: item.price,
        priceCents: item.priceCents,
        stock: item.stock,
        condition: item.condition,
        isDigital: item.isDigital,
        media: item.media,
        extraDetails: item.extraDetails,
        category: item.category,
        sub: item.subCategory,
        status: item.status === "PENDING" ? "PENDING" : item.status === "APPROVED" ? "APPROVED" : item.status,
        image: item.media && item.media.length > 0 
          ? { uri: item.media[0].url } 
          : require("../../../assets/images/sneaker.png"),
        fileType: item.isDigital ? "Digital Product" : undefined
      }

      if (item.isDigital) {
        acc.digital.push(transformedItem)
      } else {
        acc.physical.push(transformedItem)
      }

      return acc
    }, { physical: [], digital: [] })
  }


  const { physical: physicalListings, digital: digitalListings } = transformListings(listings?.data || [])


  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="font-NunitoSemiBold text-lg text-gray-600">Loading listings...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="font-NunitoSemiBold text-lg text-red-500">Failed to load listings</Text>
          <TouchableOpacity 
            className="mt-4 bg-primary-100 px-4 py-2 rounded-lg"
            onPress={() => router.reload()}
          >
            <Text className="font-NunitoSemiBold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }


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
        className="mt-5 mb-20 space-y-8"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* PHYSICAL LISTINGS */}
        <View>
          <Text className="font-NunitoSemiBold text-lg mb-4">
            Physical Listings
          </Text>
          {physicalListings.length === 0 ? (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm items-center">
              <Text className="font-NunitoRegular text-gray-500">No physical listings found</Text>
            </View>
          ) : (
            physicalListings.map((item) => (
            <TouchableOpacity
            onPress={() => router.push({
                    pathname: "/(tabs)/(listings)/details",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      priceRaw: item.priceRaw,
                      priceCents: item.priceCents,
                      status: item.status,
                      condition:item.condition,
                      images: JSON.stringify(item.media || []),
                      extraDetails: JSON.stringify(item.extraDetails),
                      stock: item.stock,
                      isDigital: item.isDigital ? "true" : "false",
                      category: JSON.stringify(item.category || null),
                      sub: JSON.stringify(item.sub || null)
                    }
                  })}
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-NunitoBold text-xl">{item.title}</Text>
                <Text
                  className={`font-NunitoBold text-base ${
                    item.status === "APPROVED"
                      ? "text-green-500"
                      : item.status === "PENDING"
                      ? "text-yellow-500"
                      : "text-red-600"
                  }`}
                >
                  {item.status}
                </Text>
              </View>

              <Image
                source={ item.image }
                className="w-full h-40 rounded-xl mb-3"
                contentFit="cover"
                style={{ borderRadius: 12, width: '100%', height: 160 }}
              />

              <Text className="font-NunitoRegular text-gray-500 mb-3">
                {item.description}
              </Text>

              <View className="flex-row justify-between items-center">
                <Text className="font-NunitoBold text-lg">{item.price}</Text>
                <TouchableOpacity 
                  className="bg-primary-100 px-4 py-2 rounded-lg"
                  onPress={() => router.push({
                    pathname: "/(tabs)/(listings)/details",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      priceRaw: item.priceRaw,
                      priceCents: item.priceCents,
                      status: item.status,
                      condition:item.condition,
                      images: JSON.stringify(item.media || []),
                      extraDetails: JSON.stringify(item.extraDetails),
                      stock: item.stock,
                      isDigital: item.isDigital ? "true" : "false",
                      category: JSON.stringify(item.category || null),
                      sub: JSON.stringify(item.sub || null)
                    }
                  })}
                >
                  <Text className="font-NunitoSemiBold text-white">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )))}
        </View>

        {/* DIGITAL LISTINGS */}
        <View>
          <Text className="font-NunitoSemiBold text-lg mb-4">
            Digital Listings
          </Text>
          {digitalListings.length === 0 ? (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm items-center">
              <Text className="font-NunitoRegular text-gray-500">No digital listings found</Text>
            </View>
          ) : (
            digitalListings.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-NunitoBold text-xl">{item.title}</Text>
                <Text
                  className={`font-NunitoBold text-base ${
                    item.status === "APPROVED"
                      ? "text-green-500"
                      : item.status === "PENDING"
                      ? "text-yellow-500"
                      : "text-red-600"
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
                <TouchableOpacity 
                  className="bg-primary-100 px-4 py-2 rounded-lg"
                  onPress={() => router.push({
                    pathname: "/(tabs)/(listings)/details",
                    params: {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      priceRaw: item.priceRaw,
                      priceCents: item.priceCents,
                      status: item.status,
                      condition:item.condition,
                      images: JSON.stringify(item.media || []),
                      extraDetails: JSON.stringify(item.extraDetails),
                      stock: item.stock,
                      isDigital: item.isDigital ? "true" : "false",
                      category: JSON.stringify(item.category || null),
                      sub: JSON.stringify(item.sub || null)
                    }
                  })}
                >
                  <Text className="font-NunitoSemiBold text-white">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default listings;
