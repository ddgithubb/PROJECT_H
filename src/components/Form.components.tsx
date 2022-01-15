import React, { LegacyRef, memo } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';
import MainStyles from '../Main.css'

const styles = StyleSheet.create({
    textInput: {
        borderRadius: 3,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#D0D0D0",
        backgroundColor: "#F0F0F0",
        textDecorationLine: "none",
        textAlignVertical: "center",
        height: 40,
        fontSize: 16,
        includeFontPadding: false,
    },
    formInput: {
        marginVertical: 10,
        paddingVertical: 0,
        paddingHorizontal: 15,
        paddingRight: 40,
    },
    digitInput: {
        textAlignVertical: "center",
        margin: 5,
        textAlign: "center",
        fontSize: 25,
        width: 35
    }
});

export const Input = memo((props: TextInput['props']) => {
    const { style, ...otherProps } = props;
    return <TextInput style={[styles.textInput, styles.formInput, MainStyles.defaultFont, MainStyles.center, style]} placeholderTextColor={"#BCBCBC"} autoCapitalize="none" {...otherProps} />
});

export const DigitInput = React.forwardRef((props: TextInput['props'], ref: LegacyRef<TextInput>) => {
    const { style, ...otherProps } = props;
    return <TextInput ref={ref} keyboardType="visible-password" style={[styles.textInput, styles.digitInput, MainStyles.defaultFont, MainStyles.center, style]} maxLength={1} {...otherProps} />
});

export const InfoButton = memo((props: Button['props']) => {
    const { color, ...otherProps } = props;
    return <Button color={color ? color : "#7878FF"} {...otherProps} />
});

export const SuccessButton = memo((props: Button['props']) => {
    const { color, ...otherProps } = props;
    return <Button color={color ? color : "#74D77F"} {...otherProps} />
});

export const DangerButton = memo((props: Button['props']) => {
    const { color, ...otherProps } = props;
    return <Button color={color ? color : "#D65D5D"} {...otherProps} />
});

export const BlankButton = memo((props: Button['props']) => {
    const { color, ...otherProps } = props;
    return <Button color={color ? color : "#D0D0D0"} {...otherProps} />
});