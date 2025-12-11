import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";

type Message = {
  id: string;
  from: "me" | "them";
  text?: string;
  imageUri?: string;
  time: string;
  read?: boolean;
};

// Simple sample messages
const initialMessages: Message[] = [
  {
    id: "m1",
    from: "them",
    text: "Hello, is the item still available?",
    time: "14:10",
    read: true,
  },
  {
    id: "m2",
    from: "me",
    text: "Yes — still available. Want to buy?",
    time: "14:12",
    read: true,
  },
  {
    id: "m3",
    from: "them",
    text: "I will pay now.",
    time: "14:13",
    read: false,
  },
];

const accountNumberRegex = /\b\d{6,}\b/; // simplistic: block sequences of 6+ digits

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const listRef = useRef<FlatList<Message> | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);


  console.log(messages)

  useEffect(() => {
    const onKeyboardShow = () => {
      // ensure list scrolls to bottom when keyboard appears
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const showSub = Keyboard.addListener("keyboardDidShow", onKeyboardShow);

    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      showSub.remove();
    };
  }, []);

  // Simulate marking messages as read when they are 'seen' — for demo: mark them read after 2s
  useEffect(() => {
    const unseen = messages.some((m) => m.from === "them" && !m.read);
    if (unseen) {
      const t = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.from === "them" ? { ...m, read: true } : m))
        );
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [messages]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    try {
      setSendingImage(true);
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      // Newer Expo returns { canceled: boolean, assets?: [{ uri }] }
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        if (uri) {
          // compress/resize before sending
          const compressed = await compressImage(uri);
          sendImageMessage(compressed);
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setSendingImage(false);
    }
  };

  const compressImage = async (uri: string) => {
    try {
      // Resize so largest dimension is 1024 and compress to ~70%
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (e) {
      console.warn("Image compression failed, sending original", e);
      return uri;
    }
  };

  const sendImageMessage = (uri: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      imageUri: uri,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };
    setMessages((p) => [...p, msg]);
    Keyboard.dismiss();
    setText("");
    // scroll to bottom
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendTextMessage = () => {
    // prevent sending account numbers
    if (accountNumberRegex.test(text)) {
      Alert.alert(
        "Message blocked",
        "Sending account numbers is not allowed in chat."
      );
      return;
    }

    if (!text.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: text.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };
    setMessages((p) => [...p, msg]);
    setText("");
    Keyboard.dismiss();
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const onChangeText = (val: string) => {
    setText(val);
    // user typing indicator (simulate other user seeing typing)
    setIsTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const me = item.from === "me";
    console.log(item);
    return (
      <View className={`px-4 my-2 ${me ? "items-end" : "items-start"}`}>
        <View
          className={`${me ? "bg-primary-100" : "bg-white"} rounded-2xl p-3 max-w-[75%] shadow-sm`}
        >
          {item.imageUri ? (
            <Image
              source={{ uri: item.imageUri }}
              style={{ width: "100%", height: 66, borderRadius: 10 }}
              contentFit="cover"
            />
          ) : null}
          {item.text ? (
            <Text
              className={`font-NunitoMedium text-lg ${me ? "text-white" : "text-black"} mt-2`}
            >
              {item.text}
            </Text>
          ) : null}
        </View>
        <View className="mt-1 flex-row items-center">
          <Text className="text-xs font-NunitoRegular text-gray-400 mr-2">
            {item.time}
          </Text>
          {me ? (
            <Text className="text-xs font-NunitoRegular text-primary-100">
              {item.read ? "Seen" : "Sent"}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 ">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* header */}
        <View className="px-4 pt-14 pb-7 flex-row items-center border-b border-gray-200 bg-white ">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-[#ECF0F4] rounded-full p-2 mr-3"
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Image
              source={require("../../../assets/images/artist-2 2.png")}
              className="w-10 mx-5 h-10 rounded-full"
            />
          </TouchableOpacity>
          <View>
            <Text className="font-RalewayBold text-xl text-black">
              Amina Bello
            </Text>
            <Text className="text-base  font-NunitoLight text-green-500">
              Online
            </Text>
          </View>
        </View>

        {/* messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 12, paddingBottom: 20 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
        />

        {/* typing indicator */}
        {isTyping ? (
          <View className="px-4 pb-1">
            <Text className="text-sm font-NunitoLight text-gray-500">
              Typing...
            </Text>
          </View>
        ) : null}

        {/* input area */}
        <View className="px-3 py-6 bg-white border-t border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={pickImage} className="p-2 mr-2">
              {sendingImage ? (
                <ActivityIndicator />
              ) : (
                <Ionicons name="image-outline" size={22} color="#333" />
              )}
            </TouchableOpacity>

            <TextInput
              value={text}
              onChangeText={onChangeText}
              onFocus={() =>
                setTimeout(
                  () => listRef.current?.scrollToEnd({ animated: true }),
                  100
                )
              }
              placeholder="Type a message"
              className="flex-1 px-3 font-NunitoMedium py-4 bg-gray-100 rounded-full text-black"
              multiline
              blurOnSubmit={false}
            />

            <TouchableOpacity
              onPress={sendTextMessage}
              className="ml-2 bg-primary-100 p-3 rounded-full items-center justify-center"
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
