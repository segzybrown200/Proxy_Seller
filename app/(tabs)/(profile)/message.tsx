import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

type Conversation = {
  id: string
  name: string
  lastMessage: string
  time: string // formatted time/date
  online?: boolean
}

const conversations: Conversation[] = [
  { id: 'c1', name: 'Amina Bello', lastMessage: 'Thanks! I will ship tomorrow.', time: 'Oct 12 • 14:23', online: true },
  { id: 'c2', name: 'John Doe', lastMessage: 'Can you update the address?', time: 'Oct 11 • 09:12', online: false },
  { id: 'c3', name: 'Sarah Lee', lastMessage: 'Payment received. Thank you!', time: 'Oct 10 • 18:01', online: true },
]

const Message = () => {
  const data = useMemo(() => conversations, [])

  const renderItem = ({ item }: ListRenderItemInfo<Conversation>) => {

    return (
      <TouchableOpacity
      onPress={()=> router.push("/(tabs)/(profile)/chat")}
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-4 py-6 bg-white rounded-lg my-2  shadow-sm"
      >
        <View className="flex-row items-center">
          <View className="relative">
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Image
                source={require("../../../assets/images/artist-2 2.png")}
                className='w-14 h-14 rounded-full'
              />
            </View>
            {/* Online indicator */}
            {item.online ? (
              <View className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            ) : null}
          </View>

          <View className="max-w-[60%] ml-2">
            <Text className="text-lg font-RalewayBold text-black">{item.name}</Text>
            <Text numberOfLines={1} className="text-base text-primary-100 mt-1 font-NunitoRegular">
              {item.lastMessage}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-xs font-NunitoBold  text-primary-100">{item.time}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-5">
        <View className="flex-row items-center mt-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-[#ECF0F4] rounded-full p-2 mr-3"
              >
                <Ionicons name="chevron-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-2xl font-NunitoBold">Message</Text>
            </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={() => (
          <View className="items-center mt-8">
            <Text className="text-gray-400 font-RalewayMedium">No messages yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Message