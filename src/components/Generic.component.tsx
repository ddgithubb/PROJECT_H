import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, Image, View, Pressable, TextInput, TouchableNativeFeedback, Animated } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import MainStyles, { DANGER_COLOR } from "../Main.css";

const styles = StyleSheet.create({
    textInput: {
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#D0D0D0",
        backgroundColor: "#F0F0F0",
        textDecorationLine: "none",
        includeFontPadding: false,
        paddingHorizontal: 20,
        paddingVertical: 0,
        textAlignVertical: "center",
    },
});

export const Heading = memo((props: Text['props']) => {
    const { style, ...otherProps } = props;
    return <Text style={[MainStyles.defaultFont, { fontSize: 40, color:  "#505050" }, style]} {...otherProps} />
});

export const SubHeading = memo((props: Text['props']) => {
    const { style, ...otherProps } = props;
    return <Text style={[MainStyles.defaultFont, { fontSize: 22, fontWeight: "bold", color: "#505050" }, style]} {...otherProps} />
});

export const Subtitle = memo((props: Text['props']) => {
    const { style, ...otherProps } = props;
    return <Text style={[{ fontSize: 16 }, MainStyles.defaultFont, style]} {...otherProps} />
});

export const DangerText = memo((props: Text['props']) => {
    const { style, ...otherProps } = props;
    return <Text style={[MainStyles.defaultFont, { fontSize: 13, color: DANGER_COLOR, lineHeight: 20 }, style]} {...otherProps} />
});

export const Link = memo((props: Text['props']) => {
    const { style, ...otherProps } = props;
    return <Pressable>
        {({ pressed }) => (
            <Text style={[MainStyles.defaultFont, { color: pressed ? '#2F2969' : "#5B4BF8", fontSize: 14, lineHeight: 20, textDecorationLine: "underline" }, style]} {...otherProps} />
        )}
    </Pressable>
});

export const Icon = memo((props: Image['props'] & { dimensions?: number, tint?: string }) => {
    const { style, dimensions, tint, ...otherProps } = props;
    return <Image style={[{ resizeMode: "contain", height: dimensions || 24, width: dimensions || 24, tintColor: tint }, style]} fadeDuration={0} {...otherProps} />
});

export function ContainerView(props: View['props']) {
    const { style, ...otherProps } = props;
    return <View style={[{ width: "100%" }, style]} {...otherProps} />
}

export const Header = memo((props: View['props']) => {
    const { style, ...otherProps } = props;
    return <View style={[{ width: "100%", height: 70, flexDirection: "row", flexWrap: "nowrap" }, style]} {...otherProps} />
});

export function HeaderViews(props: View['props']) {
    const { style, ...otherProps } = props;
    return <View style={[{ flex: 1, justifyContent: 'center', padding: 15 }, style]} {...otherProps} />
}

export const SearchBar = memo((props: TextInput['props'] & any) => {
    const { style, height, ...otherProps } = props;
    var setFontSize = height ? Math.floor((height - 35) / 3) + 13 : 13;
    return (
        <ScrollView keyboardShouldPersistTaps='always'>
            <TextInput style={[styles.textInput, MainStyles.defaultFont, MainStyles.center, { height: height || 35, fontSize: setFontSize }, style]} selectionColor="#B8B8B8" autoCapitalize="none" autoCorrect={false} keyboardType="visible-password" maxLength={30} underlineColorAndroid='rgba(0,0,0,0)' {...otherProps} />
        </ScrollView>
    )
});

export const RippleTouch = memo((props: any) => {
    const { borderless, borderRadius, RGBcolor, opacity, ...otherProps } = props;
    return (
        <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple("rgba(" + (RGBcolor || "224,224,224") + "," + (props.opacity ? opacity.toString() : "1") + ")", props.borderless ? borderless : false, props.borderRadius ? borderRadius : undefined)} {...otherProps} />
    )
});

export const EmptyComponent = memo((props: any) => {
    return (
        <ContainerView style={MainStyles.center}>
            <Subtitle style={{ margin: 20, color: "#A0A0A0", fontSize: 14 }}>{ props.children }</Subtitle>
        </ContainerView>
    )
});

export const InfoDotIndicator = memo((props: View['props'] & any) => {

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
           scaleAnim,
            {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }
        ).start();
    }, []);

    const { style, dimensions = 12, ...otherProps } = props;
    return <Animated.View style={[{ borderRadius: 50, width: dimensions, height: dimensions, backgroundColor: "#7D7DEA", transform: [{ scale: scaleAnim }] }, style]} {...otherProps} />
});

export const DangerDotIndicator = memo((props: View['props'] & any) => {

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
           scaleAnim,
            {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }
        ).start();
    }, []);

    const { style, dimensions = 12, ...otherProps } = props;
    return <Animated.View style={[{ borderRadius: 50, width: dimensions, height: dimensions, backgroundColor: DANGER_COLOR, transform: [{ scale: scaleAnim }] }, style]} {...otherProps} />
});