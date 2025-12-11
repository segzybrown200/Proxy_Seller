import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../global/store";
import { showError, showSuccess } from "utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetBanks, useGetVendorBankDetails } from "hooks/useHooks";
import { setupPayout, updateVendorBankDetails, verifyBankAccount } from "api/api";
import { mutate } from "swr";

export default function WithdrawScreen() {
  const router = useRouter();
  const user: any = useSelector((state: RootState) => state.auth.user);
  const token = user?.token;

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);

  // Bank selection
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  // Data hooks
  const { isLoading: banksLoading, banks, isError: banksError } = useGetBanks(token);
  const { bankDetails, isError: bankDetailsError, isLoading: bankDetailsLoading, mutate: mutateBankDetails } = useGetVendorBankDetails(token);



  // Normalize banks response into a flat array `bankList` so callers don't need to handle different shapes
  const bankList: any[] = Array.isArray(banks)
    ? banks
    :  banks?.data?.data ?? [];

  
  // Initialize selected bank and form when bank details are loaded
  useEffect(() => {
    if (bankDetails && bankDetails?.data?.bankCode) {
      const bankFromList = bankList.find((b: any) => b.code === bankDetails?.data?.bankCode);

      if (bankFromList) {
        setSelectedBank(bankFromList);
      }
      console.log(bankDetails?.data)
      setAccountNumber(bankDetails?.data?.accountNumber || "");
      setAccountName(bankDetails?.data?.accountName || "");
      setShowBankForm(false);
    } else if (bankList && bankList.length > 0) {
      // No bank details, show form to add one
      setShowBankForm(true);
    }
  }, [bankDetails, banks]);

  // When the form is shown and no bank is selected, pick the first bank from the list
  useEffect(() => {
    if (showBankForm && bankList && bankList.length > 0 && !selectedBank) {
      setSelectedBank(bankList[0]);
    }
  }, [showBankForm, bankList, selectedBank]);

  // Verify bank account
  const handleVerifyBank = async () => {
    if (!selectedBank) return showError("Please select a bank");
    if (!accountNumber || accountNumber.length < 10) return showError("Invalid account number");

    setVerifying(true);
    console.log(accountNumber, selectedBank.code)

    try {
      const response = await verifyBankAccount(
        {
          accountNumber,
          bankCode: selectedBank.code,
        },
        token
      );
      
      // console.log(response?.data?.data);
      if (response.data && response.data.data) {
        const verified = response.data.data.data;

        setAccountName(verified.account_name || accountName);
        showSuccess("Bank account verified successfully!");
        setShowBankForm(false);
      }
    } catch (error: any) {
      showError(error?.message || "Failed to verify bank account");
    } finally {
      setVerifying(false);
    }
  };

  // Save bank details
  const handleSaveBankDetails = async () => {
    if (!selectedBank || !accountNumber || !accountName) {
      return showError("Please fill in all fields");
    }

    setSubmitting(true);
    try {
      // Call the backend to save bank details (setupPayout endpoint)

      console.log(selectedBank, accountName, accountNumber)
      await updateVendorBankDetails(
        {
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          accountName,
        },
        token
      );

      showSuccess("Bank details saved successfully!");
      mutate(`/vendor/get-vendor-bank-details`);
      setShowBankForm(false);
    } catch (error: any) {
      showError(error?.message || "Failed to save bank details");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit withdrawal
  const requestWithdrawal = async () => {
    if (!bankDetails || !bankDetails.accountNumber) {
      return showError("Please add and verify bank details first");
    }

    if (!amount || Number(amount) < 1000) {
      return showError("Minimum withdrawal is ₦1000");
    }

    setSubmitting(true);
    try {
      await setupPayout(
        {
          amount: Number(amount),
        },
        token
      );
      showSuccess("Withdrawal request submitted successfully");
      setAmount("");
      router.back();
    } catch (error: any) {
      showError(error?.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (banksLoading || bankDetailsLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004CFF" />
      </View>
    );
  }

  // Error state
  if (banksError || bankDetailsError || !banks || banks.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-5">
        <Text className="text-center text-red-600 mb-4">
          Failed to load bank data. Please try again later.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#004CFF] px-6 p-3 rounded-lg">
          <Text className="text-white font-NunitoMedium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // console.log(accountName)
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-16">
        <TouchableOpacity onPress={() => router.back()} className="bg-[#ECF0F4] p-2 rounded-full mb-5 w-10">
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-NunitoBold mb-6">Withdraw Funds</Text>

        {/* Bank Details Section */}
        <View className="mb-6">
          <Text className="text-lg font-NunitoBold mb-3">Bank Account</Text>

          {bankDetails && bankDetails?.data?.accountNumber && !showBankForm ? (
            <>
              <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-NunitoBold text-gray-700 mb-1">{bankDetails?.data?.accountName}</Text>
                    <Text className="text-gray-600 font-NunitoMedium text-sm mb-2">{bankDetails?.data?.bankName || selectedBank?.name}</Text>
                    <Text className="text-gray-700 font-NunitoMedium">{bankDetails?.data?.accountNumber}</Text>
                  </View>
                  <View className="bg-green-500 rounded-full p-2">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowBankForm(true)} className="border border-blue-300 p-3 rounded-lg flex-row items-center justify-center">
                <Ionicons name="create" size={18} color="#004CFF" />
                <Text className="text-blue-600 font-NunitoMedium ml-2">Update Bank Details</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <Text className="text-yellow-800 font-NunitoMedium mb-3">⚠️ Bank details not found</Text>
              <Text className="text-yellow-700 text-sm mb-4">
                Please add and verify your bank account details before you can withdraw funds.
              </Text>
              <TouchableOpacity onPress={() => setShowBankForm(true)} className="bg-[#004CFF] px-4 py-3 rounded-lg self-start">
                <Text className="text-white font-NunitoMedium">Add Bank Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bank Form Modal */}
        {showBankForm && (
          <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-300">
            <Text className="font-NunitoBold mb-4 text-lg">
              {bankDetails?.data?.accountNumber ? "Update" : "Add"} Bank Account
            </Text>

            {/* Bank Selection */}
            <Text className="font-NunitoMedium mb-2">Select Bank</Text>
            <TouchableOpacity onPress={() => setShowBankModal(true)} className="border border-gray-300 p-4 rounded-lg mb-4 flex-row justify-between items-center">
              <Text className="font-NunitoMedium text-gray-700">{selectedBank?.name || "Choose Bank..."}</Text>
              <Ionicons name="chevron-down" size={20} color="#004CFF" />
            </TouchableOpacity>

            {/* Account Number Input */}
            <Text className="font-NunitoMedium mb-2">Account Number</Text>
            <TextInput
              placeholder="Enter account number"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={setAccountNumber}
              maxLength={10}
              className="border border-gray-300 font-NunitoMedium p-4 rounded-lg mb-4"
            />

            {/* Account Name Display */}
            {accountName ? (
              <View className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
                <Text className="font-NunitoMedium text-gray-600 text-sm">Account Name</Text>
                <Text className="font-NunitoBold text-gray-800">{accountName}</Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              disabled={verifying || !selectedBank || accountNumber.length < 10}
              onPress={handleVerifyBank}
              className={`p-4 rounded-lg mb-3 flex-row items-center justify-center ${verifying || !selectedBank || accountNumber.length < 10 ? "bg-gray-300" : "bg-green-600"}`}
            >
              {verifying ? <ActivityIndicator color="white" /> : <Text className="text-white font-NunitoBold">Verify Account</Text>}
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              disabled={submitting || !selectedBank || !accountNumber || !accountName}
              onPress={handleSaveBankDetails}
              className={`p-4 rounded-lg mb-3 flex-row items-center justify-center ${submitting || !selectedBank || !accountNumber || !accountName ? "bg-gray-300" : "bg-[#004CFF]"}`}
            >
              {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-NunitoBold">Save Bank Details</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowBankForm(false)} className="p-3 rounded-lg border border-gray-300">
              <Text className="text-center text-gray-700 font-NunitoMedium">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Amount Input - Only show if bank details exist */}
        {bankDetails && bankDetails?.data?.accountNumber && (
          <>
            <Text className="font-NunitoBold mb-2 text-lg">Withdrawal Amount</Text>
            <TextInput
              placeholder="Enter amount (minimum ₦1000)"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              className="border border-gray-300 p-4 font-NunitoSemiBold rounded-xl mb-4"
            />
            <Text className="text-gray-500 font-NunitoMedium text-sm mb-6">Minimum withdrawal: ₦1,000</Text>
          </>
        )}
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal visible={showBankModal} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
              <Text className="text-xl font-NunitoBold">Select Bank</Text>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={bankList}
              keyExtractor={(item: any, index) => `${(item.code ?? item.id ?? item.name ?? index).toString()}-${index}`}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBankModal(false);
                  }}
                  className="p-4 border-b border-gray-100 flex-row justify-between items-center"
                >
                  <Text className="font-NunitoMedium text-gray-800">{item.name}</Text>
                  {(selectedBank?.code === item.code || selectedBank?.id === item.id) && <Ionicons name="checkmark-circle" size={24} color="#004CFF" />}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
          </View>
        </View>
      </Modal>

      {/* Submit Withdrawal Button - Fixed at bottom */}
      {bankDetails && bankDetails.accountNumber && (
        <View className="p-5 border-t border-gray-200">
          <TouchableOpacity
            disabled={submitting || !amount || Number(amount) < 1000}
            onPress={requestWithdrawal}
            className={`p-4 rounded-xl flex-row items-center justify-center ${submitting || !amount || Number(amount) < 1000 ? "bg-gray-300" : "bg-[#004CFF]"}`}
          >
            {submitting ? <ActivityIndicator color="white" /> : <Text className="text-center text-white text-lg font-NunitoBold">Submit Withdrawal</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
