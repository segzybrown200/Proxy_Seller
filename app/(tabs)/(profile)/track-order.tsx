import React from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import MapView, { Marker } from 'react-native-maps'
import { router, useLocalSearchParams } from 'expo-router'

export default function TrackOrderScreen() {
  const params = useLocalSearchParams()
  const { orderId, orderPosition, orderQuantity, orderDate, address } = params as {
    orderId?: string
    orderPosition?: string
    orderQuantity?: string
    orderDate?: string
    address?: string
  }

  const item = {
    title: 'Nike Sneaker',
    thumbnail: require('../../../assets/images/sneaker.png'),
  }

  // If no order params provided, generate a random sample order
  const randomOrder = React.useMemo(() => {
    const id = Math.floor(1000 + Math.random() * 9000).toString()
    const qty = Math.floor(1 + Math.random() * 3).toString()
    const pos = Math.floor(Math.random() * 5).toString()
    const date = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 3600 * 1000).toLocaleDateString()
    const addr = '24 Church Rd, Surulere, Lagos'
    return { id, qty, pos, date, addr }
  }, [])

  const finalOrderId = orderId ?? randomOrder.id
  const finalOrderQuantity = orderQuantity ?? randomOrder.qty
  const finalOrderPosition = orderPosition ?? randomOrder.pos
  const finalOrderDate = orderDate ?? randomOrder.date
  const finalAddress = address ?? randomOrder.addr

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      {/* Header */}
      <View className="flex-row items-center mb-10 mt-10">
        <TouchableOpacity className="mr-3 bg-gray-200 p-2 rounded-full" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Track Order</Text>
      </View>

      <ScrollView className="p-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Order Summary (optional) */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row items-center">
              <Image source={item.thumbnail} className="w-16 h-16 rounded-md mr-3" />
              <View style={{ flex: 1 }}>
                <Text className="text-lg font-NunitoSemiBold">{item.title}</Text>
                <Text className="text-base font-NunitoRegular text-primary-100 mt-1">Order #{finalOrderId}</Text>
                {finalOrderDate ? <Text className="text-sm font-NunitoRegular text-gray-400">{finalOrderDate}</Text> : null}
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-500 font-NunitoRegular">Qty</Text>
                <Text className="text-xl text-primary-100 font-RalewaySemiBold">{finalOrderQuantity ?? '1'}</Text>
              </View>
            </View>

            <View className="mt-3">
              <Text className="text-base font-RalewayMedium text-gray-500">Delivery address</Text>
              <Text className="text-lg text-primary-100 font-NunitoMedium mt-1">{finalAddress}</Text>
            </View>

            <View className="mt-3 items-start">
              <Text className="text-base font-RalewaySemiBold text-gray-400">Current status</Text>
              <Text className="text-base font-NunitoSemiBold text-primary-100 mt-1">
                {['Ordered', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'][Math.max(0, Math.min(4, Number(finalOrderPosition)))]}
              </Text>
            </View>
          </View>
        {/* Step 1: Order Taken */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <View className="rounded-2xl bg-[#FFF6E5] p-3 mr-4">
              <Image
                source={require("../../../assets/images/order-taken.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <View>
              <Text className="text-lg font-NunitoMedium">Order Taken</Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={22} color="#004CFF" />
        </View>

        {/* Dotted Line */}
        <View className="h-6 border-l-2 border-dotted border-blue-400 ml-8" />

        {/* Step 2: Being Prepared */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <View className="rounded-2xl bg-[#EAF3FF] p-3 mr-4">
              <Image
                source={require("../../../assets/images/order-prepared.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <View>
              <Text className="text-lg font-NunitoMedium">
                Order Is Being Prepared
              </Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={22} color="#004CFF" />
        </View>

        {/* Dotted Line */}
        <View className="h-6 border-l-2 border-dotted border-blue-400 ml-8" />

        {/* Step 3: Being Delivered */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="rounded-2xl bg-[#FFECEC] p-3 mr-4">
              <Image
                source={require("../../../assets/images/order-delivered.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <View>
              <Text className="text-lg font-NunitoMedium">
                Order Is Being Delivered
              </Text>
              <Text className="text-base font-NunitoLight">
                Your delivery agent is coming
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-[#004CFF] p-2 rounded-full">
            <Ionicons name="call-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Map Preview */}
        <View className="w-full h-48 rounded-2xl overflow-hidden mt-2">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 6.5244,
              longitude: 3.3792,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{ latitude: 6.5244, longitude: 3.3792 }}
              title="Delivery Agent"
              description="On the way"
            />
          </MapView>
        </View>
      </ScrollView>
    </View>
  );
}
