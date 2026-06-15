// =========================
// components/auth/authScreen.js
// =========================

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { executeSql } from "../database/database";

const AuthScreen = ({ navigation }) => {
  // =========================
  // الحالات (STATES)
  // =========================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New: username field
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // Load saved user data
  // =========================
  useEffect(() => {
    loadRememberedUser();
  }, []);

  const loadRememberedUser = async () => {
    try {
      const savedUserId = await AsyncStorage.getItem("userId");
      if (savedUserId) {
        navigation.replace("Home", {
          userId: Number(savedUserId),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // Validation
  // =========================
  const validate = () => {
    // Check empty fields
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill all fields");
      return false;
    }

    // Check username when registering
    if (!isLogin && !username.trim()) {
      Alert.alert("Validation Error", "Please enter username");
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Invalid email format");
      return false;
    }

    // Check password length
    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // =========================
  // Login / Register
  // =========================
  const handleAuth = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      // =========================
      // LOGIN
      // =========================
      if (isLogin) {
        const result = await executeSql(
          "SELECT * FROM users WHERE email = ? AND password = ?",
          [cleanEmail, password],
        );

        if (result.length > 0) {
          // Save user when "Remember Me" is enabled
          if (rememberMe) {
            await AsyncStorage.setItem("userId", result[0].id.toString());
          }

          navigation.replace("Home", {
            userId: result[0].id,
          });
        } else {
          Alert.alert("Login Failed", "Invalid email or password");
        }
        return;
      }

      // =========================
      // REGISTER
      // =========================
      const existingUser = await executeSql(
        "SELECT * FROM users WHERE email = ?",
        [cleanEmail],
      );

      if (existingUser.length > 0) {
        Alert.alert("Registration Failed", "Email already exists");
        return;
      }

      // Insert new user with username
      const result = await executeSql(
        "INSERT INTO users (email, password, username) VALUES (?, ?, ?)",
        [cleanEmail, password, username.trim()],
      );

      const userId = result.lastInsertRowId;

      // Save session
      if (rememberMe) {
        await AsyncStorage.setItem("userId", userId.toString());
      }

      Alert.alert("Success", "Account created successfully");

      navigation.replace("Home", {
        userId,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.logo}>🍔</Text>
          <Text style={styles.title}>Food Journal</Text>

          {/* Username field (shown only in register mode) */}
          {!isLogin && (
            <TextInput
              placeholder="Username"
              placeholderTextColor="#777"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
            />
          )}

          {/* Email field */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password field */}
          <View style={styles.passwordBox}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#777"
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <TouchableOpacity
            style={styles.rememberBox}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkedBox]} />
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>

          {/* Login / Register Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#c0392b" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Register"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Switch between Login and Register */}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switch}>
              {isLogin ? "Create new account" : "Already have an account?"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// =========================
// STYLES (unchanged)
// =========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1b1b1b" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff7f1", padding: 25, borderRadius: 25 },
  logo: { fontSize: 60, textAlign: "center", marginBottom: 10 },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#7f1d1d",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: { flex: 1, paddingVertical: 15 },
  showText: { color: "#c0392b", fontWeight: "bold" },
  rememberBox: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#c0392b",
    borderRadius: 6,
    marginRight: 10,
  },
  checkedBox: { backgroundColor: "#c0392b" },
  rememberText: { fontWeight: "600", color: "#333" },
  button: {
    backgroundColor: "#c0392b",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switch: {
    marginTop: 20,
    textAlign: "center",
    color: "#c0392b",
    fontWeight: "bold",
  },
});

export default AuthScreen;
