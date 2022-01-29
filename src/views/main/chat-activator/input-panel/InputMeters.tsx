import React, { memo, useRef, useEffect } from "react";
import { Animated } from "react-native";
import { INPUT_PANEL_HEIGHT } from "../../../../config/constants";
import { METERS_WIDTH } from "../../../../services/Chat-activator.service";

export const Meters = memo(({ item }: any) => {
    
    const scaleYAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(
        scaleYAnim,
        {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 10
        }
        ).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scaleY: scaleYAnim }], width: METERS_WIDTH, borderRadius: 50, backgroundColor: "#EFEFEF", height: (item / 100) * (INPUT_PANEL_HEIGHT - 25) + 3 }} />
    )
});