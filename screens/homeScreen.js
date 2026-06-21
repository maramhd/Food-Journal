import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  ScrollView,
  
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


import * as ImagePicker from "expo-image-picker";

import { CameraView, useCameraPermissions } from "expo-camera";

import { SwipeListView } from "react-native-swipe-list-view";

import { Picker } from "@react-native-picker/picker";

import { executeSql } from "../components/database/database";

// =========================
// الفئات
// =========================

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snack", "Drink"];

const HomeScreen = ({ route, navigation }) => {
  // =========================
  // USER
  // =========================

  const { userId } = route.params;

  // =========================
  // STATES
  // =========================

  const [journals, setJournals] = useState([]);

  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [filterCategory, setFilterCategory] = useState("All");

  const [journalCategory, setJournalCategory] = useState("Breakfast");

  const [modalVisible, setModalVisible] = useState(false);

  const [cameraVisible, setCameraVisible] = useState(false);

  const MAX_DESCRIPTION = 50;

  // =========================
  // CAMERA
  // =========================

  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    loadJournals();
  }, []);

  // =========================
  // LOAD JOURNALS
  // =========================

  const loadJournals = async () => {
    try {
      const result = await executeSql(
        `
        SELECT * FROM journals
        WHERE user_id = ?
        ORDER BY id DESC
      `,
        [userId],
      );

      setJournals(result);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // PICK IMAGE
  // =========================

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],

        allowsEditing: true,

        aspect: [4, 3],

        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // TAKE PHOTO
  // =========================

  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync();

      setImage(photo.uri);

      setCameraVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // SAVE JOURNAL
  // =========================

  const saveJournal = async () => {
    // التحقق من الحقول

    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter description");

      return;
    }

    if (description.trim().length > MAX_DESCRIPTION) {
      Alert.alert("Validation Error", `Description must be ${MAX_DESCRIPTION} characters or less`);

      return;
    }

    if (!image) {
      Alert.alert("Validation Error", "Please choose image");

      return;
    }

    try {
      // UPDATE

      if (editingId) {
        await executeSql(
          `
          UPDATE journals
          SET image = ?,
              description = ?,
              category = ?
          WHERE id = ?
        `,
          [image, description, journalCategory, editingId],
        );

        Alert.alert("Success", "Journal updated");
      }

      // INSERT
      else {
        await executeSql(
          `
          INSERT INTO journals
          (user_id, image, description, category)
          VALUES (?, ?, ?, ?)
        `,
          [userId, image, description, journalCategory],
        );

        Alert.alert("Success", "Journal saved");
      }

      resetForm();

      loadJournals();

      setModalVisible(false);
    } catch (error) {
      console.log(error);

      Alert.alert("Error", "Something went wrong");
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteJournal = (id) => {
    Alert.alert("Delete Journal", "Are you sure?", [
      {
        text: "Cancel",
      },

      {
        text: "Delete",

        style: "destructive",

        onPress: async () => {
          await executeSql(
            `
              DELETE FROM journals
              WHERE id = ?
            `,
            [id],
          );

          loadJournals();
        },
      },
    ]);
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setDescription("");

    setImage(null);

    setEditingId(null);

    setJournalCategory("Breakfast");
  };

  // =========================
  // FILTER
  // =========================

  const filteredJournals =
    filterCategory === "All"
      ? journals
      : journals.filter((item) => item.category === filterCategory);

  // =========================
  // CAMERA PERMISSION
  // =========================

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>

        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>Food Journal</Text>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile", { userId })}
        >
          <Image
            source={require("../assets/profailicon.png")}
            style={styles.profileImg}
          />
        </TouchableOpacity>
      </View>

      {/* FILTER */}

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterBtn,

                filterCategory === cat && styles.activeFilter,
              ]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,

                  filterCategory === cat && styles.activeFilterText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}

      <SwipeListView
        data={filteredJournals}
        keyExtractor={(item) => item.id.toString()}
        rightOpenValue={-160}
        disableRightSwipe
        friction={8}
        tension={40}
        previewRowKey={filteredJournals[0]?.id?.toString()}
        previewOpenValue={-60}
        previewOpenDelay={1000}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No journals yet 🍔</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.95} style={styles.card}>
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.cardImage}
            />

            <View style={styles.cardBody}>
              <Text style={styles.cardDesc}>{item.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardDate}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenRow}>
            {/* EDIT */}

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setEditingId(item.id);

                setDescription(item.description);

                setImage(item.image);

                setJournalCategory(item.category);

                setModalVisible(true);
              }}
            >
              <Text style={styles.hiddenText}>Edit</Text>
            </TouchableOpacity>

            {/* DELETE */}

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteJournal(item.id)}
            >
              <Text style={styles.hiddenText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();

          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* ADD MODAL */}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {/* HEADER */}

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Journal" : "New Journal"}
            </Text>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* IMAGE */}

            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <TouchableOpacity
                style={styles.bigCameraBtn}
                onPress={() => setCameraVisible(true)}
              >
                <Text style={styles.bigCameraText}>Open Camera</Text>
              </TouchableOpacity>
            )}

            {/* BUTTONS */}

            <View style={styles.rowBtns}>
              <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
                <Text style={styles.btnText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() => setCameraVisible(true)}
              >
                <Text style={styles.btnText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* DESCRIPTION */}

            <TextInput
              placeholder="Food description (max 50 chars)..."
              value={description}
              onChangeText={setDescription}
              maxLength={MAX_DESCRIPTION}
              multiline
              style={styles.input}
            />
            <Text style={styles.charCount}>{description.length}/{MAX_DESCRIPTION}</Text>

            {/* PICKER */}

            <View style={styles.pickerBox}>
              <Picker
                selectedValue={journalCategory}
                onValueChange={setJournalCategory}
              >
                {categories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
              </Picker>
            </View>

            {/* SAVE */}

            <TouchableOpacity style={styles.saveBtn} onPress={saveJournal}>
              <Text style={styles.btnText}>
                {editingId ? "Update Journal" : "Save Journal"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* CAMERA MODAL */}

      <Modal visible={cameraVisible} animationType="fade">
        <View style={styles.cameraFull}>
          {/* CAMERA */}

          <CameraView ref={cameraRef} style={styles.camera} facing="back" />

          {/* TOP BAR */}

          <View style={styles.cameraTop}>
            <TouchableOpacity
              style={styles.closeCamera}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.closeCameraText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* CAPTURE */}

          <View style={styles.captureWrapper}>
            <TouchableOpacity style={styles.captureOuter} onPress={takePicture}>
              <View style={styles.captureInner} />
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
  container: {
    flex: 1,
    backgroundColor: "#fdf8f4",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7f1d1d",
  },

  headerBtns: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
  },

  profileImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  filterRow: {
    paddingHorizontal: 10,
  },

  filterContainer: {
    maxHeight: 60,
    marginBottom: 10,
    zIndex: 10,
  },

  filterBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },

  activeFilter: {
    backgroundColor: "#7f1d1d",
  },

  filterText: {
    color: "#333",
    fontWeight: "600",
  },

  activeFilterText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 22,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 240,
  },

  cardBody: {
    padding: 15,
  },

  cardDesc: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },

  cardCategory: {
    color: "#c0392b",
    fontWeight: "bold",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardDate: {
    color: "#999",
    fontSize: 12,
  },

  charCount: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginBottom: 10,
  },

  hiddenRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginHorizontal: 15,
    marginBottom: 15,
  },

  editBtn: {
    width: 80,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteBtn: {
    width: 80,
    backgroundColor: "#c0392b",
    justifyContent: "center",
    alignItems: "center",
  },

  hiddenText: {
    color: "#fff",
    fontWeight: "bold",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: "#7f1d1d",
    justifyContent: "center",
    alignItems: "center",
  },

  fabText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#fff7f1",
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7f1d1d",
  },

  closeBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
  },

  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  previewImage: {
    width: "100%",
    height: 280,
    borderRadius: 25,
    marginBottom: 20,
  },

  bigCameraBtn: {
    height: 280,
    borderRadius: 25,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  bigCameraText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  rowBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  galleryBtn: {
    flex: 1,
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginRight: 10,
  },

  cameraBtn: {
    flex: 1,
    backgroundColor: "#7f1d1d",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },

  saveBtn: {
    backgroundColor: "#7f1d1d",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyBox: {
    marginTop: 100,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 18,
    color: "#777",
  },

  permissionBtn: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },

  // CAMERA

  cameraFull: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  cameraTop: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },

  closeCamera: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  closeCameraText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  captureWrapper: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  captureOuter: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: "#fff",
  },
});

export default HomeScreen;
