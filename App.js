// =========================
// App.js
// =========================

import React, { useEffect, useState } from "react";

import { View, ActivityIndicator, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./screens/SplashScreen";

import AuthScreen from "./components/auth/authScreen";

import HomeScreen from "./screens/homeScreen";

import ProfileScreen from "./screens/ProfileScreen";

import { initDatabase } from "./components/database/database";

// =========================
// NAVIGATION
// =========================

const Stack = createNativeStackNavigator();

// =========================
// APP
// =========================

export default function App() {
  const [loading, setLoading] = useState(true);

  // =========================
  // INIT APP
  // =========================

  useEffect(() => {
    initializeApp();
  }, []);

  // =========================
  // DATABASE INIT
  // =========================

  const initializeApp = async () => {
    try {
      await initDatabase();

      console.log("The database has been successfully initialized.");

      // Splash delay

      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cf7f5b" />
      </View>
    );
  }

  // =========================
  // APP NAVIGATION
  // =========================

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#f7f1e5",
  },
});
