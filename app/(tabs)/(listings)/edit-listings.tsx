import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { updateListing } from "api/api";
import mime from "mime";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
import { showError, showSuccess } from "utils/toast";
import { useCategory } from "hooks/useHooks";
import CustomButton from "components/CustomButton";
import { mutate } from "swr";

const schema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  price: Yup.number()
    .typeError("Enter a valid price")
    .required("Price is required"),
  stock: Yup.number()
    .typeError("Enter a valid quantity")
    .required("Quantity is required"),
  categoryId: Yup.string().required("Category is required"),
  subcategoryId: Yup.string().required("Subcategory is required"),
  listingType: Yup.string()
    .oneOf(["physical", "digital"])
    .required("Listing type is required"),
  condition: Yup.string()
    .oneOf(["new", "used"])
    .required("Condition is required"),
  description: Yup.string().required("Description is required"),
  extraDetails: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Title required"),
      description: Yup.string().required("Description required"),
    })
  ),
});

export default function EditListingScreen() {
  const params: any = useLocalSearchParams();
  const [media, setMedia] = useState<Array<{ uri: string; type: string }>>([]);
  const [replaceMedia, setReplaceMedia] = useState(false);
  const [digitalFiles, setDigitalFiles] = useState<
    { uri: string; name?: string; size?: number; mimeType?: string }[]
  >([]);
  const { categories, isError, isLoading }:any = useCategory();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const user: any = useSelector(selectUser);
  const token = user?.token || '';
  const [loading, setLoading] = useState(false);
  // console.log("hello",categories?.categories.find((item)=>item.id === ))
  

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      price: 0,
      stock: 0,
      categoryId: "",
      subcategoryId: "",
      description: "",
      listingType: "physical",
      condition: "new",
      extraDetails: [],
    },
  });
  // Initialize form with existing data once (guarded)
  const initialized = useRef(false);
  useEffect(() => {
    // run only once per listing id to avoid infinite update loops
    if (initialized.current) return;
    if (!params?.id) return;
    initialized.current = true;

    try {
      const parsedDetails = params.extraDetails
        ? (typeof params.extraDetails === 'string' ? JSON.parse(params.extraDetails) : params.extraDetails)
        : [];

      const parsedMedia = params.media
        ? (typeof params.media === 'string' ? JSON.parse(params.media) : params.media)
        : [];

      const initialForm = {
        title: params.title || '',
        price: Number(params.price ?? params.priceRaw ?? 0) || 0,
        stock: Number(params.stock ?? 0) || 0,
        categoryId: params.category || (params.category && (params.category.id || params.category._id)) || '',
        description: params.description || '',
        listingType: (params.isDigital === true || String(params.isDigital) === 'true') ? 'digital' as const : 'physical' as const,
        condition: params.condition || 'new',
        extraDetails: Array.isArray(parsedDetails) ? parsedDetails : [],
      };

      // Reset the form once so useFieldArray renders the items correctly
      reset(initialForm);

      if (Array.isArray(parsedMedia) && parsedMedia.length > 0) {
        setMedia(parsedMedia.map((m: any) => ({ uri: m.url || m.uri || m.path, type: m.mimeType || 'image/jpeg' })));
        setReplaceMedia(false);
      }
    } catch (err) {
      console.error('Error initializing edit form:', err);
    }
  }, [params?.id]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraDetails",
  });

  const listingType = useWatch({ control, name: "listingType" });

  const handleSelectMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedMedia = await Promise.all(
        result.assets.map(async (asset) => {
          const compressed = await ImageManipulator.manipulateAsync(
            asset.uri,
            [],
            { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
          );
          return {
            uri: compressed.uri,
            type: 'image/jpeg',
          };
        })
      );

      setMedia((prev) => [...prev, ...selectedMedia]);
      setReplaceMedia(true); // Set to true when new media is added
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      if (!token) {
        Alert.alert("Error", "You need to be logged in to update your listing");
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("priceCents", (data.price * 100).toString());
      formData.append("stock", data.stock.toString());
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subcategoryId);
      formData.append("condition", data.condition);
      formData.append("isDigital", data.listingType === "digital" ? "true" : "");
      formData.append("replaceMedia", replaceMedia.toString());

      if (data.extraDetails && data.extraDetails.length > 0) {
        formData.append("extraDetails", JSON.stringify(data.extraDetails));
      }

      // Append media files
      if (media.length > 0) {
        media.forEach(async (m, index) => {
          const fileInfo = await FileSystem.getInfoAsync(m.uri);
          if (fileInfo.exists) {
            const fileExtension = m.uri.split('.').pop();
            const mimeType = mime.getType(fileExtension || '') || 'application/octet-stream';
            formData.append('media', {
              uri: m.uri,
              type: mimeType,
              name: `media_${index}.${fileExtension}`,
            } as any);
          }
        });
      }

      // Make the API call
      console.log(token)
      console.log(params.id)
      const response = await updateListing(params.id,formData, token);
      console.log(response.data)
      
      showSuccess("Listing updated successfully");
      router.back();
      
      // Optionally refresh the listings data
      mutate('/api/listings');
      
    } catch (error: any) {
      console.error(error);
      showError(error?.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold">Edit Listing</Text>
      </View>

      {/* Form Fields */}
      <View className="mt-6">
        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">TITLE</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && (
          <Text className="text-red-500 mb-2">{errors.title.message}</Text>
        )}

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">PRICE</Text>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
              value={value?.toString()}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              keyboardType="numeric"
            />
          )}
        />
        {errors.price && (
          <Text className="text-red-500 mb-2">{errors.price.message}</Text>
        )}

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">STOCK</Text>
        <Controller
          control={control}
          name="stock"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
              value={value?.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              keyboardType="numeric"
            />
          )}
        />
        {errors.stock && (
          <Text className="text-red-500 mb-2">{errors.stock.message}</Text>
        )}

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">CATEGORY</Text>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity
                onPress={() => setCategoryOpen((s) => !s)}
                className="bg-[#F1F5F9] rounded-xl p-4 mb-2 flex-row justify-between items-center"
              >
                <Text className="font-NunitoRegular">
                  {selectedCategory?.name || 'Select Category'}
                </Text>
                <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#444" />
              </TouchableOpacity>

              {categoryOpen && (
                <View className="border border-gray-200 rounded-lg mt-2 max-h-48">
                  {isLoading ? (
                    <View className="p-3">
                      <Text className="text-gray-500 font-NunitoRegular">Loading categories...</Text>
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      keyboardShouldPersistTaps="handled"
                      style={{ maxHeight: 200 }}
                    >
                      {(() => {
                        const list = Array.isArray(categories) ? categories : (categories && (categories.categories || categories.data)) || [];
                        return list.length > 0 ? (
                          list.map((cat: any) => (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => {
                                setSelectedCategory(cat);
                                onChange(String(cat.id));
                                setCategoryOpen(false);
                              }}
                              className="px-4 py-3 border-b border-gray-100"
                            >
                              <Text className="text-base font-NunitoLight">{cat.name}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View className="p-3">
                            <Text className="text-gray-500 font-NunitoRegular">No categories available</Text>
                          </View>
                        );
                      })()}
                    </ScrollView>
                  )}
                </View>
              )}
            </>
          )}
        />
        {errors.categoryId && (
          <Text className="text-red-500 mb-2">{errors.categoryId.message}</Text>
        )}

        {/* Subcategory */}
        {selectedCategory?.subCategories && selectedCategory.subCategories.length > 0 && (
          <>
            <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">SUBCATEGORY</Text>
            <Controller
              control={control}
              name="subcategoryId"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setSubcategoryOpen((s) => !s)}
                    className="bg-[#F1F5F9] rounded-xl p-4 mb-2 flex-row justify-between items-center"
                  >
                    <Text className="font-NunitoRegular">
                      {(() => {
                        const selected = selectedCategory.subCategories.find(
                          (sc: any) => sc.id === value || String(sc.id) === String(value)
                        );
                        return selected?.name || 'Select Subcategory';
                      })()}
                    </Text>
                    <Ionicons name={subcategoryOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#444" />
                  </TouchableOpacity>

                  {subcategoryOpen && (
                    <View className="border border-gray-200 rounded-lg mt-2 max-h-48">
                      <ScrollView
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        style={{ maxHeight: 200 }}
                      >
                        {selectedCategory.subCategories?.map((sub: any) => (
                          <TouchableOpacity
                            key={sub.id}
                            onPress={() => {
                              onChange(String(sub.id));
                              setSubcategoryOpen(false);
                            }}
                            className="px-4 py-3 border-b border-gray-100"
                          >
                            <Text className="text-base font-NunitoLight">{sub.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}
            />
            {errors.subcategoryId && (
              <Text className="text-red-500 mb-2">{errors.subcategoryId.message}</Text>
            )}
          </>
        )}

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">CONDITION</Text>
        <Controller
          control={control}
          name="condition"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row space-x-4 mb-4">
              <TouchableOpacity
                onPress={() => onChange("new")}
                className={`flex-1 p-4 rounded-xl ${
                  value === "new" ? "bg-[#004CFF]" : "bg-[#F1F5F9]"
                }`}
              >
                <Text
                  className={`text-center font-NunitoSemiBold ${
                    value === "new" ? "text-white" : "text-black"
                  }`}
                >
                  New
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChange("used")}
                className={`flex-1 p-4 rounded-xl ${
                  value === "used" ? "bg-[#004CFF]" : "bg-[#F1F5F9]"
                }`}
              >
                <Text
                  className={`text-center font-NunitoSemiBold ${
                    value === "used" ? "text-white" : "text-black"
                  }`}
                >
                  Used
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

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
                  className={`flex-1 mx-1 py-3 rounded-xl border 
                    ${value === type ? "border-[#004CFF] bg-[#004CFF]/10" : "border-gray-300"}`}
                >
                  <Text
                    className={`text-center font-NunitoSemiBold capitalize 
                      ${value === type ? "text-[#004CFF]" : "text-gray-700"}`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        {errors.listingType && (
          <Text className="text-red-500 font-NunitoLight text-sm">
            {errors.listingType.message}
          </Text>
        )}

        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">DESCRIPTION</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-[#F1F5F9] rounded-xl p-4 mb-4 font-NunitoRegular"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
            />
          )}
        />
        {errors.description && (
          <Text className="text-red-500 mb-2">{errors.description.message}</Text>
        )}

        {/* Media Section */}
        <Text className="text-sm text-gray-600 font-NunitoSemiBold mb-1">MEDIA</Text>
        <TouchableOpacity
          onPress={handleSelectMedia}
          className="bg-[#F1F5F9] rounded-xl p-4 mb-4 items-center"
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#004CFF" />
          <Text className="text-[#004CFF] mt-2">Upload Media</Text>
        </TouchableOpacity>

        {media.length > 0 && (
          <ScrollView horizontal className="mb-4">
            {media.map((item, index) => (
              <View key={index} className="relative mr-4">
                <Image
                  source={{ uri: item.uri }}
                  className="w-20 h-20 rounded-lg"
                />
                <TouchableOpacity
                  onPress={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Extra Details */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600 font-NunitoSemiBold">
              ADDITIONAL DETAILS
            </Text>
            <TouchableOpacity
              onPress={() => append({ title: "", description: "" })}
              className="bg-[#004CFF] rounded-full p-2"
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {fields.map((field, index) => (
            <View key={field.id} className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Detail {index + 1}</Text>
                <TouchableOpacity
                  onPress={() => remove(index)}
                  className="bg-red-500 rounded-full p-2"
                >
                  <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>

              <Controller
                control={control}
                name={`extraDetails.${index}.title`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-[#F1F5F9] rounded-xl p-4 mb-2 font-NunitoRegular"
                    placeholder="Title"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              <Controller
                control={control}
                name={`extraDetails.${index}.description`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-[#F1F5F9] rounded-xl p-4 font-NunitoRegular"
                    placeholder="Description"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <CustomButton
        containerStyles="mb-32"
          title="Update Listing"
          handlePress1={handleSubmit(onSubmit)}
          isLoading={loading}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}
