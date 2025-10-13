
    import {
      View,
      Text,
      Image,
      TouchableOpacity,
      SafeAreaView,
      ScrollView,
      Dimensions,
      NativeSyntheticEvent,
      NativeScrollEvent,
    } from 'react-native';
    import { useLocalSearchParams, router } from 'expo-router';
    import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';

    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const CAROUSEL_HEIGHT = 300;

    const Details = () => {
      const params = useLocalSearchParams();
      const { id } = params as { id?: string };
      const scrollRef = useRef<ScrollView | null>(null);
      const [activeIndex, setActiveIndex] = useState(0);

      // Placeholder product data (replace with real data later)
      const product = {
        id: id ?? '1',
        title: 'Nike Sneaker',
        rating: 4.7,
        likes: '1.5k',
        views: '1.5k',
        description:
          'High-top design for ankle support during quick cuts and jumps. Air cushioning for explosive responsiveness on the court. Durable rubber outsole with herringbone traction for multi-directional grip.',
        brand: 'Nike',
        size: '5,10,20,50',
        gender: 'Male, Female',
        condition: 'Brand New',
        addressTitle: 'Store Address',
        address: 'Lekki Phase 1 Ikate, Lekki-Epe Expressway Epe Lagos, Nigeria',
        vendor: {
          name: 'Michael Segun',
          phone: '+2347042604550',
          avatar: require('../../../assets/images/artist-2 2.png'),
        },
        price: '₦23,000',
        images: [
          require('../../../assets/images/sneaker.png'),
          require('../../../assets/images/sneaker.png'),
          require('../../../assets/images/sneaker.png'),
        ],
      };

      const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setActiveIndex(index);
      };

      return (
        <SafeAreaView className="flex-1 bg-white">
          {/* Carousel */}
          <View style={{ height: CAROUSEL_HEIGHT }}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
              {product.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={img}
                  style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* overlay buttons */}
            <TouchableOpacity
              className="absolute left-4 top-14 rounded-full bg-white p-2"
              onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View className="absolute right-6 bottom-4 rounded-lg bg-primary-100 p-3 py-1">
              <Text className="text-white font-NunitoLight">Verified ID</Text>
            </View>

            {/* dots */}
            <View className="absolute left-0 right-0 -bottom-7 flex-row justify-center items-center">
              {product.images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === activeIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: i === activeIndex ? '#2563EB' : '#E5E7EB',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="px-4 py-4">
              <Text className="text-2xl mt-6 font-RalewayBold">{product.title}</Text>
              <View className="flex-row items-center gap-3 mt-2">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text className="ml-1 font-NunitoSemiBold">{product.rating}</Text>
                </View>
                <Text className="ml-2 font-NunitoSemiBold">⭐ {product.likes}</Text>
                <Text className="ml-2 font-NunitoSemiBold">👍 {product.views}</Text>
              </View>

              <Text className="mt-4 text-gray-600 font-NunitoRegular">{product.description}</Text>

              <View className="mt-6 grid grid-cols-3 gap-4">
                <View>
                  <Text className="text-lg font-RalewayMedium text-gray-500">Brand</Text>
                  <Text className="mt-1 font-NunitoBold text-lg">{product.brand}</Text> 
                </View>
                <View>
                  <Text className="text-lg font-RalewayMedium text-gray-500">Size</Text>
                  <Text className="mt-1 font-NunitoMedium text-lg">{product.size}</Text>
                </View>
                <View>
                  <Text className="text-lg font-RalewayMedium text-gray-500">Gender</Text>
                  <Text className="mt-1 font-NunitoBold text-lg">{product.gender}</Text>
                </View>
              </View>

              <View className="mt-6">
                <Text className="text-lg font-RalewayMedium text-gray-500">Condition</Text>
                <Text className="mt-1 font-NunitoBold text-lg">{product.condition}</Text>
              </View>

              <View className="mt-6">
               <View className='flex flex-row gap-4 mb-1'>
                 <Text className="font-NunitoBold text-lg text-textColor-100">{product.addressTitle}</Text>
                <Text className=" font-NunitoBold text-lg">Lagos, Nigeria</Text>
               </View>
                <Text className="text-gray-500 mt-1 font-NunitoLight">{product.address}</Text>
              </View>

              <View className="mt-6 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Image source={product.vendor.avatar} className="w-12 h-12 rounded-full" />
                  <View className="ml-3">
                    <Text className="font-NunitoSemiBold text-lg">Vendor Profile</Text>
                    <Text className="text-sm text-gray-500 font-NunitoRegular">Name: {product.vendor.name}</Text>
                    <Text className="text-sm font-NunitoRegular text-gray-500">Phone.No {product.vendor.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-primary-100 px-3 py-2 rounded-md">
                  <Text className="text-white font-NunitoSemiBold">Start Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* bottom bar */}
          <View className="absolute left-0 right-0 bottom-0 bg-white px-4 py-4 border-t border-gray-100 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 font-RalewayMedium">Price</Text>
              <Text className="text-2xl font-RalewayBold mt-1 ">{product.price}</Text>
            </View>
            <TouchableOpacity className="bg-primary-100 px-6 py-3 rounded-lg">
              <Text className="text-white  font-NunitoSemiBold">Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    };

    export default Details;