import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from 'expo-image';
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createListing } from "api/api";
import mime from "mime";
import { useSelector } from "react-redux";
import { selectUser } from "global/authSlice";
import { showError, showSuccess } from "utils/toast";
import { useCategory } from "hooks/useHooks";
import CustomButton from "components/CustomButton";
import { mutate } from "swr";


const schema = Yup.object().shape({
  listName: Yup.string().required("List name is required"),
  price: Yup.number()
    .typeError("Enter a valid price")
    .required("Price is required"),
  quantity: Yup.number()
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
  details: Yup.string().required("Details are required"),
  descriptions: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Title required"),
      description: Yup.string().required("Description required"),
    })
  ),
}).test("images-required", "At least one image is required", function(data) {
  return (data as any).media && Array.isArray((data as any).media) && (data as any).media.length > 0;
});

type FormValues = {
  listName: string;
  price: number;
  quantity: number;
  categoryId: string;
  subcategoryId: string;
  listingType: "physical" | "digital";
  condition: "new" | "used";
  details: string;
  descriptions: { title: string; description: string }[];
  media: { uri: string; type: string }[];
};

const addproduct = () => {

  const [media, setMedia] = useState<{ uri: string; type: string }[]>([]);
  const [negotiable, setNegotiable] = useState(false);
  const [digitalFile, setDigitalFile] = useState<any>(null);
  const [digitalFiles, setDigitalFiles] = useState<
    { uri: string; name?: string; size?: number; mimeType?: string }[]
  >([]);
  const {categories, isError, isLoading} = useCategory()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [subcategoryOpen, setSubcategoryOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const user:any = useSelector(selectUser)
  const tokens = user?.token || ''
  const [loading, setLoading] = useState(false);


  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // fallback: short delay (no specific mutate here)
      await new Promise((r) => setTimeout(r, 800));
    } catch (e) {
      console.warn('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, []);


  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<any>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      listName: "",
      price: 0,
      quantity: 0,
      categoryId: "",
      subcategoryId: "",
      media: [],
      details: "",
      listingType: "physical",
      condition: "new",
      descriptions: [],
    },
  });

  // keep react-hook-form's `media` value in sync with local media state
  useEffect(() => {
    try {
      setValue("media", media || []);
    } catch (e) {
      console.warn("Failed to set form media value", e);
    }
  }, [media, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });
  const listingType = useWatch({ control, name: "listingType" });

  const handleSelectMedia = async () => {
    // Ask for permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access gallery is required!");
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
          if (asset.type === "image") {
            const compressed = await ImageManipulator.manipulateAsync(
              asset.uri,
              [],
              { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            return {
              uri: compressed.uri,
              type: asset.type,
            };
          }

          if (asset.type === "video") {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (fileInfo.exists) {
              const fileSizeMB = (fileInfo.size || 0) / (1024 * 1024);
              if (fileSizeMB > 50) {
                alert("This video is large and may take time to upload.");
              }
              return {
                uri: asset.uri,
                type: asset.type,
                size: fileInfo.size,
              };
            } else {
              return {
                uri: asset.uri,
                type: asset.type,
              };
            }
          }

          return { uri: asset.uri, type: asset.type };
        })
      );

      setMedia((prev: any) => [...prev, ...selectedMedia]);
    }
  };
   const removeDigitalFile = (index: number) => {
    setDigitalFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };
  // 📂 Handle digital file upload
  const handleSelectDigitalFiles = async () => {
    try {
      // Allow multiple selection where supported
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/epub+zip",
          "application/zip",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });

      // res can be one of:
      // - a success with assets array (modern expo) -> res.assets
      // - a single-file success (older behaviour) -> res.type === 'success' and res.uri present
      // - canceled -> res.type === 'cancel'

      if ((res as any).type === "cancel") return;

      // If assets present (modern response)
      if ((res as any).assets && Array.isArray((res as any).assets)) {
        const assets = (res as any).assets as any[];
        const items = assets.map((a) => ({
          uri: a.uri,
          name: a.name || a.filename || a.uri.split("/").pop(),
          size: a.size,
          mimeType: a.mimeType || a.type,
        }));
        setDigitalFiles((prev) => [...prev, ...items]);
        return;
      }

      // Fallback: older single file response shape
      if ((res as any).uri) {
        const single = res as any;
        const name = single.name || single.uri?.split("/").pop();
        const info = await FileSystem.getInfoAsync(single.uri);
        if (info.exists) {
          setDigitalFiles((prev) => [
            ...prev,
            {
              uri: single.uri,
              name,
              size: info.size,
              mimeType: single.mimeType || single.mimeType,
            },
          ]);
        } else {
          setDigitalFiles((prev) => [
            ...prev,
            {
              uri: single.uri,
              name,
              mimeType: single.mimeType || single.mimeType,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn("DocumentPicker error:", err);
      Alert.alert("Error", "Could not pick document(s). Try again.");
    }
  };

  const onSubmit = async (data: any) => {
    console.log(data)
    setLoading(true);
    try {
      if (data.listingType === "digital" && digitalFiles.length === 0) {
        setLoading(false);
        showError("Please upload at least one digital file for digital listings.");
        return;
      }

      // from auth store
      const formData = new FormData();

      formData.append("title", data.listName);
      formData.append("description", data.details);
      formData.append("price", data.price.toString());
      formData.append("stock", data.quantity.toString());
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subcategoryId);
      formData.append("isDigital", data.listingType === "digital" ? "true" : "");
      formData.append("condition", data.condition);
      formData.append("extraDetails", JSON.stringify(data.descriptions));

      console.log("FormData created:", formData);

      // Attach media (images/videos)
      for (const file of media) {
        const fileName = file.uri.split("/").pop();
        const mimeType = mime.getType(file.uri) || "image/jpeg";
        formData.append("media", {
          uri: file.uri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      // Attach digital files
      for (const file of digitalFiles) {
        const fileName = file.name || file.uri.split("/").pop();
        const mimeType = file.mimeType || mime.getType(file.uri) || "application/octet-stream";
        formData.append("digitalFiles", {
          uri: file.uri,
          name: fileName,
          type: mimeType,
        } as any);
      }

      console.log("Files attached to FormData");

      const response = await createListing(formData, tokens);
      console.log("Listing created:", response.data);
      
      showSuccess("Listing created successfully!");
      mutate("/listings/vendor");
      reset();
      setMedia([]);
      setDigitalFiles([]);
      setDigitalFile(null);
      router.replace("/(tabs)/(listings)/listings");
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Failed to upload listing";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white p-5" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="flex-row items-center mt-14 mb-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#ECF0F4] rounded-full p-2 mr-3"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-NunitoBold">Add New List</Text>
      </View>

      {/* List Name */}
      <Text className="font-RalewayMedium uppercase text-lg mb-2">
        List Name
      </Text>
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
          {(errors.listName as any)?.message}
        </Text>
      )}
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
          {(errors.listingType as any)?.message}
        </Text>
      )}

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
                className={`flex-1 mx-1 py-3 rounded-xl border 
            ${value === cond ? "border-[#004CFF] bg-[#004CFF]/10" : "border-gray-300"}`}
              >
                <Text
                  className={`text-center font-NunitoSemiBold capitalize 
              ${value === cond ? "text-[#004CFF]" : "text-gray-700"}`}
                >
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.condition && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {(errors.condition as any)?.message}
        </Text>
      )}

      {listingType === "physical" && (
        <>
          <Text className="font-RalewayMedium uppercase text-lg mt-4 mb-2">
            Upload Photo/Video <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {media.map((item, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: item.uri }}
                  className="w-20 h-20 rounded-lg"
                  contentFit="cover"
                  style={{ borderRadius: 12, width: 80, height: 80 }}
                />
                <TouchableOpacity
                  onPress={() => removeMedia(index)}
                  className="absolute top-0 right-0 bg-white rounded-full p-1"
                >
                  <Text className="text-red-500">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              onPress={handleSelectMedia}
              className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg items-center justify-center"
            >
              <Text className="text-gray-400 font-NunitoMedium text-lg">
                Add
              </Text>
            </TouchableOpacity>
          </View>
          {media.length === 0 && (
            <Text className="text-red-500 font-NunitoLight text-sm mt-2">At least one image is required</Text>
          )}
        </>
      )}

      {/* Digital File Upload + Preview Images */}
      {listingType === "digital" && (
        <View className="mt-4">
          <Text className="font-RalewaySemiBold text-lg">Upload Digital File(s)</Text>

          <TouchableOpacity
            onPress={handleSelectDigitalFiles}
            className="border-2 border-dashed border-gray-400 rounded-lg py-4 mt-2 items-center justify-center"
          >
            <Text className="text-[#004CFF] font-NunitoSemiBold">Select File(s)</Text>
            <Text className="text-sm font-NunitoLight text-gray-500 mt-1">PDF, EPUB, ZIP, etc.</Text>
          </TouchableOpacity>

          {/* selected files list */}
          {digitalFiles.length > 0 && (
            <View className="mt-3">
              {digitalFiles.map((f, i) => (
                <View
                  key={`${f.uri}-${i}`}
                  className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2"
                >
                  <View className="flex-1 pr-2">
                    <Text className="font-NunitoSemiBold">{f.name || f.uri.split("/").pop()}</Text>
                    <Text className="text-sm font-NunitoMedium text-gray-500">
                      {f.size ? `${Math.round((f.size / (1024 * 1024)) * 100) / 100} MB` : ""}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => removeDigitalFile(i)} className="px-3 py-1">
                    <Text className="text-red-500 font-NunitoMedium">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Preview images for digital product */}
          <Text className="font-RalewaySemiBold text-lg mt-4">Preview Images <Text className="text-red-500">*</Text></Text>
          <Text className="text-sm text-gray-500 font-NunitoLight mb-2">Upload images that will serve as previews/thumbnails for your digital product.</Text>

          <View className="flex-row flex-wrap gap-3">
            {media.map((item, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: item.uri }}
                  className="w-20 h-20 rounded-lg"
                  contentFit="cover"
                  style={{ borderRadius: 12, width: 80, height: 80 }}
                />
                <TouchableOpacity
                  onPress={() => removeMedia(index)}
                  className="absolute top-0 right-0 bg-white rounded-full p-1"
                >
                  <Text className="text-red-500">×</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleSelectMedia}
              className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg items-center justify-center"
            >
              <Text className="text-gray-400 font-NunitoMedium text-lg">Add</Text>
            </TouchableOpacity>
          </View>
          {media.length === 0 && (
            <Text className="text-red-500 font-NunitoLight text-sm mt-2">At least one preview image is required</Text>
          )}
        </View>
      )}

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
      </View>
      {errors.price && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {(errors.price as any)?.message}
        </Text>
      )}

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
      {errors.quantity && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {(errors.quantity as any)?.message}
        </Text>
      )}

      {/* Category and Subcategory */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Category</Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              onPress={() => {
                setCategoryOpen((s) => !s);
              }}
              className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2 flex-row justify-between items-center"
            >
              <Text className={`font-NunitoLight ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedCategory?.name || 'Select category'}
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
                    {Array.isArray(categories.categories) && categories.categories.length > 0 ? (
                      categories.categories?.map((cat: any) => (
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
                    )}
                  </ScrollView>
                )}
              </View>
            )}
          </>
        )}
      />
      {errors.categoryId && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {(errors.categoryId as any)?.message}
        </Text>
      )}

      {/* Subcategory */}
      {selectedCategory?.subCategories && selectedCategory.subCategories.length > 0 && (
        <>
          <Text className="font-RalewaySemiBold text-lg mt-4">Subcategory</Text>
          <Controller
            control={control}
            name="subcategoryId"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setSubcategoryOpen((s) => !s)}
                  className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2 flex-row justify-between items-center"
                >
                  <Text className={`font-NunitoLight ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {(() => {
                      const selected = selectedCategory.subCategories.find(
                        (sc: any) => sc.id === value || String(sc.id) === String(value)
                      );
                      return selected?.name || 'Select subcategory';
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
            <Text className="text-red-500 font-NunitoLight text-sm">
              {(errors.subcategoryId as any)?.message}
            </Text>
          )}
        </>
      )}

      {/* Add Other Descriptions */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={() => append({ title: "", description: "" })}
          className="bg-[#004CFF]/10 rounded-lg py-3 items-center mb-3"
        >
          <Text className="text-[#004CFF] font-NunitoSemiBold text-lg">
            + Add More Description
          </Text>
        </TouchableOpacity>

        {fields.map((item, index) => (
          <View
            key={item.id}
            className="mb-4 border border-gray-200 p-3 rounded-lg"
          >
            <Text className="text-gray-600 font-RalewaySemiBold text-lg">
              Title
            </Text>
            <Controller
              control={control}
              name={`descriptions.${index}.title`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter title"
                  className="border border-gray-300 rounded-xl font-NunitoMedium text-lg px-3 py-2 mt-2"
                />
              )}
            />

            <Text className="text-gray-600 mt-3 font-RalewaySemiBold text-lg">
              Description
            </Text>
            <Controller
              control={control}
              name={`descriptions.${index}.description`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter description"
                  className="border border-gray-300 rounded-xl font-NunitoMedium text-lg px-3 py-2 mt-2"
                />
              )}
            />

            <TouchableOpacity onPress={() => remove(index)} className="mt-2">
              <Text className="text-red-500 font-NunitoRegular  text-sm">
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

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
      {errors.details && (
        <Text className="text-red-500 font-NunitoRegular text-sm">
          {(errors.details as any)?.message}
        </Text>
      )}

      

      {/* Submit */}
        <CustomButton
          handlePress1={() =>
            handleSubmit(
              onSubmit,
              (errs) => {
                console.log("Validation errors:", errs);
                const firstMsg = String(Object.values(errs)[0]?.message || "Please complete all required fields.");
                showError(firstMsg);
              }
            )()
          }
          isLoading={loading}
          title="SAVE CHANGES"
          containerStyles="mt-8 mb-72"
        />
        
    </ScrollView>
  );
};

export default addproduct;
