import React from "react";
import { Image, StyleSheet } from "react-native";

export default function Logo({ style }) {
  return (
    <Image
      source={require("../assets/logo.png")}
      style={[styles.image, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 220,
    height: 220,
  },
});
