import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormField from "../../components/FormFields";
import CustomButton from "../../components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";

const Schema = yup.object({
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm password is required"),
});

const ResetPassword = () => {
  const params = useLocalSearchParams();
  const email = (params as any)?.email || "";

  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(Schema) });

  const onSubmit = (data: any) => {
    Keyboard.dismiss();
    // TODO: call API to reset password using email + data.password
    // For now redirect to login
    router.replace("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white p-5" behavior="padding">
      <View className="absolute">
        <Image source={require("../../assets/images/Bubbles.png")} />
      </View>
      <View className="mt-20">
        <Text className="font-RalewayBold text-[36px]">Reset Password</Text>
        <Text className="text-gray-500 text-lg font-NunitoLight mt-2">Set a new password for {email || 'your account'}.</Text>
      </View>

      <View className="mt-10">
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              title="Password"
              onBlur={onBlur}
              value={value}
              handleChangeText={onChange}
              name="password"
              errors={errors}
              placeholder="New password"
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField
              title="Confirm Password"
              onBlur={onBlur}
              value={value}
              handleChangeText={onChange}
              name="confirmPassword"
              errors={errors}
              placeholder="Repeat password"
              
            />
          )}
        />
      </View>

      <View className="flex-1 justify-end items-center mb-10">
        <CustomButton title="Reset Password" handlePress1={handleSubmit(onSubmit)} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;