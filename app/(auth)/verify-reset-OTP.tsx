import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import CustomButton from "../../components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import OtpTextInput from 'react-native-text-input-otp'


const VerifyResetOTP = () => {
  const [isSubmitting, setisSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [OTP, setOTP] = useState("");

  const params = useLocalSearchParams();
  const email = (params as any)?.email || '';

  const submit = () => {
    setisSubmitting(true);
    Keyboard.dismiss();
    if (OTP === "") {
      setisSubmitting(false);
      setError("Please enter OTP");
    } else if (OTP.length !== 6) {
      setisSubmitting(false);
      setError("Please enter 6 digit OTP");
    } else {
      // OTP verified for reset flow -> go to reset-password
      router.replace(`/(auth)/reset-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <>
      <SafeAreaView className=" flex-1 bg-white ">
        <View className="absolute">
          <Image source={require("../../assets/images/Bubbles.png")} />
        </View>
        <View>
          <View
            className="mt-16 p-5 w-full mb-[30px]"
          >

            <Text className="font-RalewayBold mt-[20px] self-center text-[28px]">
              Verify your Email
            </Text>
            <View className="flex flex-row mt-2 items-center gap-2 self-center ">
              <Text className="font-NunitoLight w-[90%] text-lg  text-gray-500 self-center text-center ">
                Enter 6-digits code we sent to {email ? email : 'your email'}
              </Text>
            </View>
          </View>


          <View className="mt-[3px] p-5">
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <OtpTextInput
                otp={OTP}
                setOtp={setOTP}
                digits={6}
                autoFocus={true}
                style={{
                  borderRadius: 0,
                  borderTopWidth: 1,
                  borderRightWidth: 2,
                  borderLeftWidth: 1,
                  height: 70,
                  backgroundColor: "transparent",
                  borderColor: "#004CFF",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                fontStyle={{
                  fontSize: 35,
                  fontWeight: "bold",
                  color: "black",

                }}
                focusedStyle={{
                  borderColor: "#004CFF",
                  borderBottomWidth: 1,
                  borderTopWidth: 1,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,
                }}
              />
            </TouchableWithoutFeedback>
            <Text className="text-red-500 font-NunitoRegular text-[13px] mt-[10px]">
              {error}
            </Text>
          </View>

          <View className="flex flex-1 justify-end flex-col  items-center mt-[120px] p-5">
            <CustomButton
              title="Verify"
              isLoading={isSubmitting}
              handlePress1={submit}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default VerifyResetOTP;