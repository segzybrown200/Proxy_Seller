import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState, useEffect } from "react";
import CustomButton from "../../components/CustomButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router, useLocalSearchParams } from "expo-router";
import OtpTextInput from 'react-native-text-input-otp'
import { verifyOTP, sendOTPEmail } from "api/api";
import { showError } from "utils/toast";


const verifyEmail = () => {
  const [isSubmitting, setisSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [OTP, setOTP] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
   const {email, phone, vendorId, verifyOption} = useLocalSearchParams()

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
      verifyOTP({email: email as string, phone: phone as string, otp: OTP }).then((response)=>{
        setisSubmitting(false)
        router.replace({pathname: '/(auth)/kyc', params: {email: email, phone: phone, vendorId: vendorId, token: response.data?.data?.token}});

      }).catch((error)=>{
        setisSubmitting(false)
        showError(error.message)
      })

    }
  };

  // Countdown timer for resend (60s)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    try {
      setIsResending(true);
      await sendOTPEmail({ email: email as string, phone: phone as string, verifyOption: verifyOption as string });
      setSecondsLeft(60);
    } catch (err: any) {
      showError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
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
            className="mt-16 p-5 w-full mb-[30px]">
              <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left-long" size={25} color="black" />
          </TouchableOpacity>

            <Text className="font-RalewayBold mt-[20px] self-center text-[28px]">
              OTP Verification
            </Text>
            <View className="flex flex-row mt-2 items-center gap-2 self-center ">
              <Text className="font-NunitoLight w-[90%] text-lg text-gray-500 self-center text-center ">
                An OTP has been sent to your email address. Please enter the 6-digit code below to verify your account.
              </Text>
            </View>
          </View>
  

          <View className="mt-[3px] p-5">
            <Text className="font-NunitoSemiBold text-base mb-2 ml-1">Enter 6-digit OTP</Text>
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
            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-500 mr-3 font-NunitoLight">Didn't receive the code?</Text>
              <TouchableOpacity
                disabled={secondsLeft > 0 || isResending}
                onPress={handleResend}
              >
                <Text className={`text-primary-600 font-NunitoSemiBold ${secondsLeft > 0 || isResending ? 'opacity-40' : ''}`}>
                  {secondsLeft > 0 ? `Resend (${String(Math.floor(secondsLeft / 60)).padStart(2,'0')}:${String(secondsLeft % 60).padStart(2,'0')})` : (isResending ? 'Resending...' : 'Resend Code')}
                </Text>
              </TouchableOpacity>
            </View>
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

export default verifyEmail;
