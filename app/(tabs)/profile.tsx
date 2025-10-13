import { View, Text,Button } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux'
import { logoutState } from 'global/authSlice'

const profile = () => {
  const disptach = useDispatch()
  return (
    <View className='flex-1 flex justify-center items-center'>
      <Button title='test' onPress={() => disptach(logoutState())} />
    </View>
  )
}

export default profile