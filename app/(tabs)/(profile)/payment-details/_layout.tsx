import { Stack } from 'expo-router'

export default function PaymentDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ headerShown: false }} 
      />
    </Stack>
  )
}
