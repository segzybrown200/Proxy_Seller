import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLocalSearchParams, router } from "expo-router";

const schema = Yup.object().shape({
  listName: Yup.string().required("List name is required"),
  price: Yup.number()
    .typeError("Enter a valid price")
    .required("Price is required"),
  quantity: Yup.number()
    .typeError("Enter a valid quantity")
    .required("Quantity is required"),
  category: Yup.string().required("Category is required"),
  listingType: Yup.string()
    .oneOf(["physical", "digital"])
    .required("Listing type is required"),
  condition: Yup.string()
    .oneOf(["new", "used"])
    .required("Condition is required"),
  details: Yup.string().required("Details are required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  descriptions: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Title required"),
      description: Yup.string().required("Description required"),
    })
  ),
});

const EditList = () => {
  const params = useLocalSearchParams();
  const listData = params.list ? JSON.parse(params.list as string) : null;

  const [media, setMedia] = useState<{ uri: string; type: string }[]>(
    listData?.media || []
  );
  const [negotiable, setNegotiable] = useState(listData?.negotiable || false);
  const [digitalFiles, setDigitalFiles] = useState<
    { uri: string; name?: string; size?: number; mimeType?: string }[]
  >(listData?.digitalFiles || []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      listName: listData?.listName || "",
      price: listData?.price || 0,
      quantity: listData?.quantity || 0,
      category: listData?.category || "",
      details: listData?.details || "",
      city: listData?.city || "",
      country: listData?.country || "",
      listingType: listData?.listingType || "physical",
      condition: listData?.condition || "new",
      descriptions: listData?.descriptions || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });

  useEffect(() => {
    if (listData) reset(listData);
  }, [listData]);

  // 📸 Image selection
  const handleSelectMedia = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.image, ImagePicker.MediaType.video],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedMedia = await Promise.all(
        result.assets.map(async (asset) => {
          if (asset.type === "image") {
            const compressed = await ImageManipulator.manipulateAsync(
              asset.uri,
              [],
              { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            return { uri: compressed.uri, type: asset.type };
          }
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          return { uri: asset.uri, type: asset.type, size: fileInfo.size };
        })
      );
      setMedia((prev: any) => [...prev, ...selectedMedia]);
    }
  };

  // 📂 Digital files
  const handleSelectDigitalFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/zip", "*/*"],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.type === "cancel") return;

      if ((res as any).assets) {
        const items = (res as any).assets.map((a: any) => ({
          uri: a.uri,
          name: a.name,
          size: a.size,
          mimeType: a.mimeType,
        }));
        setDigitalFiles((prev) => [...prev, ...items]);
      } else if ((res as any).uri) {
        const single = res as any;
        const info = await FileSystem.getInfoAsync(single.uri);
        setDigitalFiles((prev) => [
          ...prev,
          { uri: single.uri, name: single.name, size: info.size },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick document(s). Try again.");
    }
  };

  const removeDigitalFile = (index: number) => {
    setDigitalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Update Handler
  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      negotiable,
      media,
      digitalFiles,
    };

    console.log("Updated product:", payload);
    Alert.alert("Success", "List updated successfully!");
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mt-14 mb-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Edit List Details</Text>
      </View>

      {/* List Name */}
      <Text className="font-RalewayMedium uppercase text-lg mb-2">List Name</Text>
      <Controller
        control={control}
        name="listName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="List Name"
            value={value}
            onChangeText={onChange}
            className="border font-NunitoMedium border-gray-300 text-lg rounded-xl px-4 py-4 mb-2"
          />
        )}
      />
      {errors.listName && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {errors.listName.message}
        </Text>
      )}

      {/* Listing Type */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Listing Type</Text>
      <Controller
        control={control}
        name="listingType"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row justify-between mt-2">
            {["physical", "digital"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => onChange(type)}
                className={`flex-1 mx-1 py-3 rounded-xl border ${
                  value === type
                    ? "border-[#004CFF] bg-[#004CFF]/10"
                    : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-NunitoSemiBold capitalize ${
                    value === type ? "text-[#004CFF]" : "text-gray-700"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Condition */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Condition</Text>
      <Controller
        control={control}
        name="condition"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row justify-between mt-2">
            {["new", "used"].map((cond) => (
              <TouchableOpacity
                key={cond}
                onPress={() => onChange(cond)}
                className={`flex-1 mx-1 py-3 rounded-xl border ${
                  value === cond
                    ? "border-[#004CFF] bg-[#004CFF]/10"
                    : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-NunitoSemiBold capitalize ${
                    value === cond ? "text-[#004CFF]" : "text-gray-700"
                  }`}
                >
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Media Section */}
      <Text className="font-RalewayMedium uppercase text-lg mt-4 mb-2">
        Upload Photo/Video
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {media.map((item, index) => (
          <Image
            key={index}
            source={{ uri: item.uri }}
            className="w-20 h-20 rounded-lg"
          />
        ))}
        <TouchableOpacity
          onPress={handleSelectMedia}
          className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg items-center justify-center"
        >
          <Text className="text-gray-400 font-NunitoMedium text-lg">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Price */}
      <Text className="font-RalewayMedium uppercase text-lg mt-4">Price</Text>
      <View className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 mt-2">
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="₦5000"
              keyboardType="numeric"
              value={String(value)}
              onChangeText={onChange}
              className="flex-1 font-NunitoMedium text-lg"
            />
          )}
        />
        <TouchableOpacity
          onPress={() => setNegotiable(!negotiable)}
          className="ml-2 flex-row items-center"
        >
          <View
            className={`w-5 h-5 rounded border ${
              negotiable ? "bg-[#004CFF]" : "border-gray-400"
            }`}
          />
          <Text className="ml-1 text-gray-700 font-NunitoSemiBold">
            Negotiable
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quantity */}
      <Text className="font-RalewaySemiBold text-lg mt-4 ">Quantity</Text>
      <Controller
        control={control}
        name="quantity"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="10"
            keyboardType="numeric"
            value={String(value)}
            onChangeText={onChange}
            className="border border-gray-300 font-NunitoMedium text-lg rounded-xl px-4 py-3 mt-2"
          />
        )}
      />

      {/* Category */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Category</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="e.g. Electronics"
            value={value}
            onChangeText={onChange}
            className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2"
          />
        )}
      />

      {/* Details */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Details</Text>
      <Controller
        control={control}
        name="details"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline
            placeholder="Enter details..."
            className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2 min-h-[100px]"
          />
        )}
      />

      {/* City */}
      <Text className="font-RalewaySemiBold text-lg mt-4">City</Text>
      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Enter city"
            value={value}
            onChangeText={onChange}
            className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2"
          />
        )}
      />
      {errors.city && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {errors.city.message}
        </Text>
      )}

      {/* Country */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Country</Text>
      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Enter country"
            value={value}
            onChangeText={onChange}
            className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2"
          />
        )}
      />
      {errors.country && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {errors.country.message}
        </Text>
      )}

      {/* Save Button */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="bg-[#004CFF] py-4 rounded-xl mt-8 items-center mb-48"
      >
        <Text className="text-white font-NunitoLight text-base">
          UPDATE LIST
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditList;
