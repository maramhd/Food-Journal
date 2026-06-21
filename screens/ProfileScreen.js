import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { executeSql } from "../components/database/database";

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit Username
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Edit Email
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Reset Password Modal
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await executeSql("SELECT * FROM users WHERE id = ?", [userId]);
      if (user.length > 0) {
        setUsername(user[0].username || "");
        setEmail(user[0].email || "");
      }

      const posts = await executeSql(
        "SELECT COUNT(*) as count FROM journals WHERE user_id = ?",
        [userId]
      );
      setPostCount(posts[0]?.count || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE USERNAME
  // =========================
  const saveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    try {
      setUpdateLoading(true);
      await executeSql("UPDATE users SET username = ? WHERE id = ?", [
        newUsername.trim(),
        userId,
      ]);
      setUsername(newUsername.trim());
      setEditMode(false);
      Alert.alert("Success", "Username updated");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update username");
    } finally {
      setUpdateLoading(false);
    }
  };

  const startEdit = () => {
    setNewUsername(username);
    setEditMode(true);
  };

  // =========================
  // UPDATE EMAIL
  // =========================
  const saveEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert("Error", "Invalid email format");
      return;
    }

    try {
      setUpdateLoading(true);
      const existing = await executeSql(
        "SELECT * FROM users WHERE email = ? AND id != ?",
        [newEmail.trim().toLowerCase(), userId]
      );
      if (existing.length > 0) {
        Alert.alert("Error", "Email already in use");
        return;
      }

      await executeSql("UPDATE users SET email = ? WHERE id = ?", [
        newEmail.trim().toLowerCase(),
        userId,
      ]);
      setEmail(newEmail.trim().toLowerCase());
      setEditEmailMode(false);
      Alert.alert("Success", "Email updated");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update email");
    } finally {
      setUpdateLoading(false);
    }
  };

  const startEditEmail = () => {
    setNewEmail(email);
    setEditEmailMode(true);
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("userId");
          navigation.replace("Auth");
        },
      },
    ]);
  };

  // =========================
  // RESET PASSWORD FROM PROFILE
  // =========================
  const handleResetPassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);

      const user = await executeSql(
        "SELECT * FROM users WHERE id = ? AND password = ?",
        [userId, currentPassword]
      );

      if (user.length === 0) {
        Alert.alert("Error", "Current password is incorrect");
        return;
      }

      await executeSql("UPDATE users SET password = ? WHERE id = ?", [
        newPassword,
        userId,
      ]);

      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => {
            setResetModalVisible(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#c0392b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* AVATAR */}
        <View style={styles.avatarBox}>
          <Image
            source={require("../assets/profailicon.png")}
            style={styles.avatarImg}
          />
        </View>

        {/* POST COUNT */}
        <View style={styles.statsBox}>
          <Text style={styles.statsNumber}>{postCount}</Text>
          <Text style={styles.statsLabel}>Posts</Text>
        </View>

        {/* USERNAME SECTION */}
        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          {editMode ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter username"
                placeholderTextColor="#999"
                autoFocus
              />
              {updateLoading ? (
                <ActivityIndicator size="small" color="#c0392b" />
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.saveSmallBtn}
                    onPress={saveUsername}
                  >
                    <Text style={styles.saveSmallText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelSmallBtn}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={styles.cancelSmallText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.editRow}>
              <Text style={styles.valueText}>{username || "Not set"}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={startEdit}>
                <Image
                  source={require("../assets/editicon.png")}
                  style={styles.editIcon}
                />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* EMAIL SECTION */}
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          {editEmailMode ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              {updateLoading ? (
                <ActivityIndicator size="small" color="#c0392b" />
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.saveSmallBtn}
                    onPress={saveEmail}
                  >
                    <Text style={styles.saveSmallText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelSmallBtn}
                    onPress={() => setEditEmailMode(false)}
                  >
                    <Text style={styles.cancelSmallText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.editRow}>
              <Text style={styles.valueText}>{email}</Text>
              <TouchableOpacity style={styles.editBtn} onPress={startEditEmail}>
                <Image
                  source={require("../assets/editicon.png")}
                  style={styles.editIcon}
                />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* RESET PASSWORD + LOGOUT ROW */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => setResetModalVisible(true)}
          >
            <Text style={styles.resetBtnText}>Change password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Image
              source={require("../assets/logouticon.png")}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ========================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================= */}
      <Modal visible={resetModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            {/* Current Password */}
            <Text style={styles.modalLabel}>Current Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current password"
                placeholderTextColor="#999"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPw}
              />
              <TouchableOpacity onPress={() => setShowCurrentPw(!showCurrentPw)}>
                <Text style={styles.showText}>
                  {showCurrentPw ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.modalLabel}>New Password</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={styles.passwordInput}
                placeholder="New password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPw}
              />
              <TouchableOpacity onPress={() => setShowNewPw(!showNewPw)}>
                <Text style={styles.showText}>
                  {showNewPw ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {resetLoading ? (
              <ActivityIndicator size="large" color="#c0392b" />
            ) : (
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleResetPassword}
              >
                <Text style={styles.saveBtnText}>Update Password</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setResetModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdf8f4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  backBtn: { color: "#c0392b", fontWeight: "bold", fontSize: 16 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#7f1d1d" },

  scroll: { alignItems: "center", paddingBottom: 40 },

  avatarBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff7f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#c0392b",
    overflow: "hidden",
  },
  avatarImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  statsBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7f1d1d",
    marginRight: 8,
  },
  statsLabel: { fontSize: 16, color: "#777" },

  section: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
  },
  label: { fontSize: 13, color: "#999", marginBottom: 6, fontWeight: "600" },
  valueText: { fontSize: 17, color: "#333", fontWeight: "500" },

  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editActions: { flexDirection: "row" },
  saveSmallBtn: {
    backgroundColor: "#c0392b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 6,
  },
  saveSmallText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  cancelSmallBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cancelSmallText: { color: "#666", fontWeight: "bold", fontSize: 13 },
  editBtn: {
    backgroundColor: "#f39c12",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  editBtnText: { color: "#fff", fontWeight: "bold" },

  resetBtn: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#c0392b",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  resetBtnText: { color: "#c0392b", fontWeight: "bold", fontSize: 14 },

  btnRow: {
    flexDirection: "row",
    width: "85%",
    gap: 10,
    marginTop: 15,
  },

  logoutBtn: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#c0392b",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  logoutText: { color: "#c0392b", fontWeight: "bold", fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff7f1",
    padding: 25,
    borderRadius: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#7f1d1d",
  },
  modalLabel: {
    fontSize: 13,
    color: "#999",
    marginBottom: 6,
    fontWeight: "600",
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: "#c0392b",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { marginTop: 15, alignItems: "center", padding: 12 },
  cancelText: { color: "#777", fontWeight: "bold", fontSize: 16 },
});

export default ProfileScreen;
