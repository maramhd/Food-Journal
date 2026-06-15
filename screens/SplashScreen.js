import React, { useEffect, useRef } from "react";

import { View, Text, StyleSheet, Image, Animated } from "react-native";

const SplashScreen = ({ navigation }) => {
  // =========================
  // ANIMATION
  // =========================

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const dotsAnim = useRef(new Animated.Value(0)).current;

  // =========================
  // START ANIMATION
  // =========================

  useEffect(() => {
    // دوران دائرة التحميل

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    ).start();

    // حركة النقاط

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),

        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    // الانتقال

    const timeout = setTimeout(() => {
      navigation.replace("Auth");
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  // =========================
  // ROTATION
  // =========================

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],

    outputRange: ["0deg", "360deg"],
  });

  // =========================
  // DOTS
  // =========================

  const activeWidth = dotsAnim.interpolate({
    inputRange: [0, 1],

    outputRange: [0, 80],
  });

  return (
    <View style={styles.container}>
      {/* IMAGE */}

      <Image
        source={require("../assets/splash-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* TITLE */}

      <Text style={styles.title}>Food Journal</Text>

      {/* SUBTITLE */}

      <Text style={styles.subtitle}>
        Track your meals and let flavors tell your story
      </Text>

      {/* LOADING */}

      <Text style={styles.loading}>LOADING...</Text>

      {/* SPINNER */}

      <Animated.View
        style={[
          styles.loader,

          {
            transform: [
              {
                rotate,
              },
            ],
          },
        ]}
      />

      {/* DOTS */}

      <View style={styles.dotsRow}>
        <View style={styles.dot} />

        <View style={styles.dot} />

        <View style={styles.dot} />

        <Animated.View
          style={[
            styles.activeDot,

            {
              width: activeWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#f7f1e5",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 25,
  },

  image: {
    width: 230,

    height: 230,

    marginBottom: 15,
  },

  title: {
    fontSize: 42,

    fontWeight: "bold",

    color: "#b56d4c",

    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,

    textAlign: "center",

    color: "#3b2b25",

    marginBottom: 45,

    lineHeight: 28,

    paddingHorizontal: 10,
  },

  loading: {
    fontSize: 20,

    fontWeight: "600",

    color: "#3b2b25",

    marginBottom: 25,
  },

  loader: {
    width: 85,

    height: 85,

    borderWidth: 8,

    borderColor: "#e6cfc1",

    borderTopColor: "#cf7f5b",

    borderRadius: 50,

    marginBottom: 60,
  },

  dotsRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  dot: {
    width: 14,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#c99b7b",

    marginHorizontal: 12,
  },

  activeDot: {
    position: "absolute",

    left: 0,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#cf7f5b",
  },
});

export default SplashScreen;
