import React, { memo, useRef, useMemo, useEffect } from "react";
import { Animated, Easing } from "react-native";
import { MESSAGE_HEIGHT, METERING_INTERVAL_DURATION, CHAIN_METERS_WIDTH } from "../../../../../config/constants";

export const ResponseMeters = memo(({ item, seeked }: any) => {

    const seekedAnim = useRef(new Animated.Value(1)).current;
    const meterHeight = useMemo(() => Math.floor((item / 100) * (MESSAGE_HEIGHT - 10)) + 7, [item]);

    useEffect(() => {
        if (seeked) {
            Animated.timing(
                seekedAnim,
                {
                    toValue: 1 / meterHeight,
                    duration: METERING_INTERVAL_DURATION,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }
            ).start();
        } else {
            seekedAnim.setValue(1);
        }
    }, [seeked])

    return (
        <Animated.View style={{ transform: [{ scaleY: seekedAnim }], width: CHAIN_METERS_WIDTH - 1, borderRadius: 50, marginRight: 1, backgroundColor: seeked ? "rgb(223, 70, 70)" : "rgb(240,240,240)", height: meterHeight }} />
    )
}, checkSeeked);

function checkSeeked(prevProps: any, nextProps: any) {
    return prevProps.seeked == nextProps.seeked && prevProps.item == nextProps.item;
}