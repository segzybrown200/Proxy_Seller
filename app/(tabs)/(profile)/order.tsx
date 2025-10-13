import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Image } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

type Order = {
  id: string
  title: string
  date: string
  thumbnail: any
  address: string
  status: string
}

const ordersSample: Order[] = [
  {
    id: 'o1',
    title: 'Order #1001',
    date: 'Oct 12, 2025',
    thumbnail: require('../../../assets/images/sneaker.png'),
    address: '12 Ajayi St, Ikeja, Lagos',
    status: 'Delivered',
  },
  {
    id: 'o2',
    title: 'Order #1002',
    date: 'Oct 10, 2025',
    thumbnail: require('../../../assets/images/sneaker.png'),
    address: '24 Church Rd, Surulere, Lagos',
    status: 'In transit',
  },
]

const historySample: Order[] = [
  {
    id: 'h1',
    title: 'Order #0900',
    date: 'Sep 30, 2025',
    thumbnail: require('../../../assets/images/artist-2 2.png'),
    address: '2 Glover Rd, Ikoyi, Lagos',
    status: 'Returned',
  },
]

const OrderScreen = () => {
  const [active, setActive] = useState<'orders' | 'history'>('orders')

  const data = useMemo(() => (active === 'orders' ? ordersSample : historySample), [active])

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity onPress={()=>router.push("/(tabs)/(profile)/track-order")} activeOpacity={0.8} className="bg-white rounded-lg mx-2 my-2 p-3 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Image source={item.thumbnail} className="w-16 h-16 rounded-md mr-3" />
        <View>
          <Text className="text-lg font-RalewaySemiBold text-black">{item.title}</Text>
          <Text className="text-base w-[80%] font-NunitoLight text-primary-100 mt-1">{item.address}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-xs font-NunitoRegular text-gray-400">{item.date}</Text>
        <Text className={`text-base mt-1 font-NunitoMedium ${item.status === 'Delivered' ? 'text-green-500' : 'text-primary-100'}`}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-5">
       <View className="flex-row items-center mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full mt-4 p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Orders</Text>
      </View>

      <View className="flex-row mt-4 mb-5 px-4">
        <TouchableOpacity onPress={() => setActive('orders')} className={`flex-1 py-2 items-center ${active === 'orders' ? 'border-b-2 border-primary-100' : ''}`}>
          <Text className={`font-NunitoSemiBold text-lg ${active === 'orders' ? 'text-black' : 'text-gray-500'}`}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActive('history')} className={`flex-1 py-2 items-center ${active === 'history' ? 'border-b-2 border-primary-100' : ''}`}>
          <Text className={` font-NunitoSemiBold text-lg  ${active === 'history' ? 'text-black' : 'text-gray-500'}`}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={data} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ paddingVertical: 12 }} />
    </SafeAreaView>
  )
}

export default OrderScreen