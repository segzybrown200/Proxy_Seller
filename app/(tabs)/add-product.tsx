import React, { useState } from "react";
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
  category: Yup.string().required("Category is required"),
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
});

const addproduct = () => {

  const [media, setMedia] = useState<{ uri: string; type: string }[]>([]);
  const [negotiable, setNegotiable] = useState(false);
  const [digitalFile, setDigitalFile] = useState<any>(null);
  const [digitalFiles, setDigitalFiles] = useState<
    { uri: string; name?: string; size?: number; mimeType?: string }[]
  >([]);
  const {categories, isError, isLoading} = useCategory()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const user:any = useSelector(selectUser)
  const tokens = user?.token || ''
  const [loading, setLoading] = useState(false);


  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      listName: "",
      price: 0,
      quantity: 0,
      category: "",
      details: "",
      listingType: "physical",
      condition: "new",
      descriptions: [],
    },
  });

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
    formData.append("categoryId", data.category);
    formData.append("isDigital", data.listingType === "digital" ? "true" : "");
    formData.append("condition", data.condition);
    formData.append("extraDetails", JSON.stringify(data.descriptions));

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
    console.log(formData)

    createListing( formData, tokens).then((response) => {
      showSuccess("Listing created successfully!");

      mutate("/listings/vendor")
      router.replace("/(tabs)/(listings)/listings")
      console.log(response.data)
    }).catch((error) => {
      showError(error.response?.data?.message || "Failed to upload listing");
    }).finally(() => {
      setLoading(false);
      reset()
    })
  } catch (error: any) {
    showError("An unexpected error occurred. Please try again.");
  }
};

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white p-5">
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
          {errors.listName.message}
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
          {errors.listingType.message}
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
          {errors.condition.message}
        </Text>
      )}

      {listingType === "physical" && (
        <>
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
              <Text className="text-gray-400 font-NunitoMedium text-lg">
                Add
              </Text>
            </TouchableOpacity>
          </View>
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
          <Text className="font-RalewaySemiBold text-lg mt-4">Preview Images</Text>
          <Text className="text-sm text-gray-500 font-NunitoLight mb-2">Upload images that will serve as previews/thumbnails for your digital product.</Text>

          <View className="flex-row flex-wrap gap-3">
            {media.map((item, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: item.uri }}
                  className="w-20 h-20 rounded-lg"
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
      {errors.price && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {errors.price.message}
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
          {errors.quantity.message}
        </Text>
      )}

      {/* Category */}
      <Text className="font-RalewaySemiBold text-lg mt-4">Category</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <>
            {/* Show selected label or placeholder */}
            <TouchableOpacity
              onPress={() => setCategoryOpen((s) => !s)}
              className="border font-NunitoMedium text-lg border-gray-300 rounded-xl px-4 py-3 mt-2 flex-row justify-between items-center"
            >
              <Text className={`font-NunitoLight ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                {(() => {
                  const selected = categories.categories?.find((c: any) => (c._id === value || c.id === value || String(c._id) === String(value) || String(c.id) === String(value)));
                  return selected?.name || selected?.categoryName || selected?.title || selected?.label || (value ? String(value) : 'Select category');
                })()}
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
                      categories.categories?.map((cat: any) => {
                        const id = cat._id || cat.id || cat.uid || String(cat)
                        const name = cat.name || cat.categoryName || cat.title || String(cat)
                        return (
                          <TouchableOpacity
                            key={id}
                            onPress={() => {
                              onChange(String(id))
                              setCategoryOpen(false)
                            }}
                            className="px-4 py-3 border-b border-gray-100"
                          >
                            <Text className="text-base font-NunitoLight">{name}</Text>
                          </TouchableOpacity>
                        )
                      })
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
      {errors.category && (
        <Text className="text-red-500 font-NunitoLight text-sm">
          {errors.category.message}
        </Text>
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
          {errors.details.message}
        </Text>
      )}

      

      {/* Submit */}
        <CustomButton handlePress1={handleSubmit(onSubmit)} isLoading={loading} title="SAVE CHANGES" containerStyles="mt-8 mb-72" />
        
    </ScrollView>
  );
};

export default addproduct;
