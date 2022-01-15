import { StyleSheet } from "react-native";

export const DANGER_COLOR = "#D43333";

const MainStyles = StyleSheet.create({
    defaultFont: {
        fontFamily: "NotoSansKR-Regular",
        color: "#2D2C3E",
        includeFontPadding: false
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },
});

export default MainStyles;