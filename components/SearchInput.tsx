import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from "react-native-gesture-handler";

interface Props {
  placeholder: string;
  otherStyles?: string;
  placeholderTextColor?: string;
  white?: string;
}


export const SearchComponent:React.FC<Props> = ({otherStyles, placeholder,placeholderTextColor,white}) => {
  return (
    <View className={`w-full bg-[#F0F0F0] ${white === "yes" ? "bg-white" : null}  px-4 py-1.5  rounded-3xl  flex flex-row items-center ${otherStyles}`}>
      {/* text Input */}
      <TextInput
        className="ml-2 flex-1 font-NunitoSemiBold text-[18px] text-gray-400"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || "#C4C4C4"}
        underlineColorAndroid="transparent"
      />
      <FontAwesome name="search" size={24} color="black" />



    </View>
  )
}