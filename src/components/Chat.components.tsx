import React from 'react';
import { StyleSheet } from "react-native";
import { View } from "react-native";
import MainStyles from "../Main.css";

const styles = StyleSheet.create({
    photoView: {
        aspectRatio: 1,
        borderRadius: 50,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#E7E7E7",
        backgroundColor: "#FAFAFA",
    },
});

export function PhotoView(props: View['props'] & any) {
    const { style, dimensions, ...otherProps } = props;
    const dimension = dimensions ? dimensions : 80
    return <View style={[ MainStyles.center, styles.photoView, { maxHeight: dimension, maxWidth: dimension, minHeight: dimension, minWidth: dimension }, style ]} {...otherProps} />
}