import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Linking,
  SafeAreaView,
} from "react-native";
import { Image } from 'expo-image';
import { Ionicons, Entypo } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

export default function ListDetailsScreen() {
  const params: any = useLocalSearchParams();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // no specific mutate available on this screen; short delay fallback
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.warn('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const {
    title,
    description,
    price,
    priceRaw,
    priceCents,
    status,
    images: passedImages,
    isDigital,
    condition,
    stock,
    media,
    extraDetails,
    fileType,
    category,
    sub
  } = params || {};
  
  
  


  const defaultImage = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f";

  const safeParseArray = (val: any) => {
    if (!val) return [];
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return val.split ? val.split(",").map((s: string) => s.trim()).filter(Boolean) : [val];
      }
    }
    if (Array.isArray(val)) return val;
    return [val];
  };


  const extractImageUrls = (arr: any[]) => {
    return (arr || [])
      .map((a: any) => {
        if (!a) return null;
        if (typeof a === "string") return a;
        if (a.url) return a.url;
        if (a.uri) return a.uri;
        if (a.path) return a.path;
        if(a.mime === "image/jpeg") return a.mime
        return null;
      })
      .filter(Boolean);
  };


  const mediaObjects = safeParseArray(passedImages || media);
  const parsedImages = extractImageUrls(mediaObjects);
  const [images] = useState(parsedImages.length > 0 ? parsedImages : [defaultImage]);
  // Finding images with fileType of image/jpeg (safe parse)
  const imageOfJpeg: any[] = (mediaObjects || []).filter((type: any) => type?.mimeType === "image/jpeg");
  const [activeIndex, setActiveIndex] = useState(0);
  const [verifiedDocs, setVerifiedDocs] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    (mediaObjects || []).forEach((m: any, idx: number) => {
      const key = m?.id || m?.url || String(idx);
      if (key) map[key] = false;
    });
    return map;
  });

  const onScroll = (event: any) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex) setActiveIndex(slide);
  };

  const parseJsonIfString = (val: any) => {
    if (!val) return null;
    if (typeof val === "string") {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  };

  const extra = parseJsonIfString(extraDetails) || [];
  const categoryObj = parseJsonIfString(category || params.category) || null;
  const subCategoryObj = parseJsonIfString(sub || params.sub) || null;
  const isDigitalBool = String(isDigital) === "true" || isDigital === true;
  // console.log(category)




  const formatPriceDisplay = (p: any, pCents: any) => {
    if ((!p || p === '') && pCents) return `₦${(Number(pCents) / 100).toLocaleString()}`;
    if (typeof p === "string") {
      if (p.includes("₦")) return p;
      const n = Number(p.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(n)) return `₦${n.toLocaleString()}`;
      return p;
    }
    if (typeof p === "number") return `₦${p.toLocaleString()}`;
    return "";
  };
  const displayPrice = formatPriceDisplay(price || priceRaw || params.priceRaw, priceCents || params.priceCents);
  const displayStatus = (status === "PENDING") ? "Pending" : (status === "APPROVED" ? "Approved" : status);


  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row mt-10 justify-between items-center p-5">
        <TouchableOpacity
          className="bg-[#ECF0F4] p-2 rounded-full"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-RalewayBold">List Details</Text>
        <TouchableOpacity onPress={() => {
          // Pass all listing data to edit screen
          router.push({
            pathname: "/(tabs)/(listings)/edit-listings",
            params: {
              id: params.id,
              title: title,
              price: priceRaw,
              stock: stock,
              category: categoryObj?.id || categoryObj?._id,
              subcategory: subCategoryObj?.id || subCategoryObj?._id,
              description: description,
              isDigital: isDigital,
              condition: condition,
              media: JSON.stringify(media || []),
              extraDetails: JSON.stringify(extraDetails || [])
            }
          });
        }}>
          <Text className="text-[#004CFF] font-RalewayBold text-lg">EDIT</Text>
        </TouchableOpacity>
      </View>

  <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Image Carousel */}
        {
          !isDigitalBool && (
          <View className="relative items-center mt-2">
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
                  borderRadius: 20,
                  marginRight: 10,
                }}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="absolute bottom-3 flex-row self-center">
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-2 w-2 mx-1 rounded-full ${index === activeIndex ? "bg-[#004CFF]" : "bg-gray-300"}`}
              />
            ))}
          </View>
        </View>
          )
        }

        {
          (imageOfJpeg && isDigitalBool) && (
          <View className="relative items-center mt-2">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {imageOfJpeg.map((img:any) => (
              <Image
                key={img.id}
                source={{ uri: img.url }}
                style={{
                  width,
                  height: 220,
                  borderRadius: 20,
                  marginRight: 10,
                }}
                contentFit="cover"
              />
            ))}
          </ScrollView>

          <View className="absolute bottom-3 flex-row self-center">
            {imageOfJpeg.map((_:any, index:any) => (
              <View
                key={index}
                className={`h-2 w-2 mx-1 rounded-full ${index === activeIndex ? "bg-[#004CFF]" : "bg-gray-300"}`}
              />
            ))}
          </View>
        </View>
          )
        }


        {/* Item Info */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-RalewayBold">{title}</Text>
            <Text className="text-2xl font-RalewayBold">{displayPrice}</Text>
          </View>

          <View className="flex-row items-center mt-5 justify-between">
            <View className="flex-row items-center">
              {isDigitalBool ? (
                <View className="flex-row items-center">
                  <Ionicons name="document-text-outline" size={16} color="gray" />
                  <Text className="text-gray-500 font-NunitoSemiBold text-lg ml-1">{fileType || 'Digital'}</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Entypo name="box" size={16} color="gray" />
                  <Text className="text-gray-500 font-NunitoSemiBold text-lg ml-1">Physical</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center">
              <View className={`px-3 py-1 rounded-full ${
                (status === 'APPROVED' || displayStatus === 'Approved') ? 'bg-green-100' : (status === 'PENDING' || displayStatus === 'Pending') ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Text className={`font-NunitoBold ${
                  (status === 'APPROVED' || displayStatus === 'Approved') ? 'text-green-600' : (status === 'PENDING' || displayStatus === 'Pending') ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {displayStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Item Details */}
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Condition</Text>
              <Text className="font-NunitoBold text-lg mt-1 capitalize">{condition}</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Listing Type</Text>
              <Text className="font-NunitoBold text-lg mt-1">{isDigitalBool ? 'Digital' : 'Physical'}</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-base font-RalewayMedium">Quantity</Text>
              <Text className="font-NunitoBold text-lg mt-1">{stock}</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-gray-400 text-base font-RalewayMedium">Category</Text>
              <Text className="font-NunitoBold text-lg mt-1">{categoryObj?.name || (category && String(category)) || 'Uncategorized'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-base font-RalewayMedium">Sub-Category</Text>
              <Text className="font-NunitoBold text-lg mt-1">{subCategoryObj?.name || ''}</Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Extra details */}
          {extra && extra.length > 0 && (
            <View className="mb-4 px-1">
              <Text className="text-gray-400 text-base font-RalewayMedium mb-2">Extra Details</Text>
              {Array.isArray(extra) ? extra.map((e: any, i: number) => (
                <View key={i} className="mb-2">
                  <Text className="font-NunitoSemiBold">{e.title}</Text>
                  <Text className="text-gray-600">{e.description}</Text>
                </View>
              )) : (
                <Text className="text-gray-600">{String(extra)}</Text>
              )}
            </View>
          )}

          {/* Documents (for digital products) */}
          {isDigitalBool && mediaObjects && mediaObjects.length > 0 && (
            <View className="mb-4 px-1">
              <Text className="text-gray-400 text-base font-RalewayMedium mb-2">Documents</Text>
              {mediaObjects.map((m: any, i: number) => {
                const key = m?.id || m?.url || String(i);
                const url = (typeof m === 'string') ? m : (m?.url || m?.uri || m?.path);
                const mime = m?.mimeType || m?.type || '';
                const size = m?.size ? `${(m.size/1024).toFixed(1)} KB` : '';
                const name = url ? String(url).split('/').pop() : `file-${i}`;
                const verified = !!verifiedDocs[key];

                return (
                  <View key={key} className="mb-3 bg-white p-3 rounded-lg shadow-sm">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 mr-2">
                        <Text className="font-NunitoSemiBold">{name}</Text>
                        <Text className="text-gray-500 text-sm">{mime} {size ? `• ${size}` : ''}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          className="px-3 py-2 bg-primary-100 rounded-lg mr-2"
                          onPress={() => { if (url) Linking.openURL(String(url)) }}
                        >
                          <Text className="text-white font-NunitoSemiBold">Open</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Description */}
          <View className="pb-10">
            <Text className="text-gray-400 text-base font-RalewayMedium mb-2">Description</Text>
            <Text className="text-gray-600 text-lg font-NunitoLight leading-5">{description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
