import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';


const _layout = () => {
  const pathname = usePathname();

  const showTabBar =
    pathname === '/' ||
    pathname === '/orders' ||
    pathname === '/listings' ||
    pathname === '/add-product' ||
    pathname === '/notifications' ||
    pathname === '/profile';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: showTabBar
          ? {
              backgroundColor: 'white',
              borderTopWidth: 0,
              height: 100,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              position: 'absolute',
              bottom: 0,
              paddingTop: 10,
              elevation: 20,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }
          : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <MaterialIcons name="dashboard" size={29} color="#004CFF" />
            ) : (
              <MaterialIcons name="dashboard" size={29} color="gray" />
            ),
        }}
      />

      <Tabs.Screen
        name="(listings)"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="reorder-three" size={32} color="#004CFF" />
              
            ) : (
              <Ionicons name="reorder-three" size={32} color="gray" />
            ),
        }}
      />

      {/* Floating Center Button */}
      <Tabs.Screen
        name="add-product"
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={props.onPress ?? undefined}
              onLongPress={props.onLongPress ?? undefined}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              style={styles.centerButton}
            >
              {/* Plus Icon from expo vector */}
              <Ionicons name="add" size={36} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="(notifications)"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="notifications" size={29} color="#004CFF" />
              
            ) : (
              <Ionicons name="notifications" size={29} color="gray" />
            ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={26} color="#004CFF" />
            ) : (
              <Ionicons name="person" size={26} color="gray" />
            ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    backgroundColor: '#004CFF',
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    top: -25, // makes it float above the tab bar
    shadowColor: '#004CFF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
});

export default _layout;
