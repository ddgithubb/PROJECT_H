import React, { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { MESSAGE_HEIGHT, MESSAGE_MAX_WIDTH, MESSAGE_SPACER } from '../../../../config/constants';

const MIN_WIDTH = 90;
const VAR_RANGE = MESSAGE_MAX_WIDTH - MIN_WIDTH; 

export const PlaceholderGenerator = memo(({ leftPadding, width, rightPadding }: any) => {

    const [ placholders, setPlaceholders ] = useState<JSX.Element[]>([]);

    useEffect(() => {
        let temp = [];
        let curWidth = width;
        let i = 0;
        while (true) {
            if (curWidth <= MESSAGE_MAX_WIDTH) {
                temp.push(getPlaceholder(curWidth, i));
                break;
            } else if (curWidth <= MIN_WIDTH + MESSAGE_MAX_WIDTH - 40) {
                temp.unshift(getPlaceholder(curWidth, i));
                break;
            }
            let width = (Math.random() * VAR_RANGE) + MIN_WIDTH;
            temp.push(getPlaceholder(width, i))
            curWidth -= width;
            i++;
        }
        setPlaceholders(temp);
    }, [width]);

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", marginLeft: leftPadding || 0, marginRight: rightPadding || 0, width }}>
            { placholders }
        </View>
    )

});

function getPlaceholder(width: number, key: number) {
    return <View key={"PLACEHOLDER_"+key.toString()} style={{ width: width - MESSAGE_SPACER, marginHorizontal: (MESSAGE_SPACER / 2), height: MESSAGE_HEIGHT, backgroundColor: "#4F4F4F", borderTopRightRadius: 20, borderBottomRightRadius: 5, borderTopLeftRadius: 10, borderBottomLeftRadius: 25 }} />;
}