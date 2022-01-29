import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, View } from 'react-native';
import { ContainerView, Icon, RippleTouch, Subtitle } from '../../../../components/Generic.component';
import { ACTIONS_RESOURCE, LINE_MORE_ICON } from '../../../../services/Resource.service';
import { memo } from 'react';
import { ACTION_BAR_HEIGHT } from '../../../../config/constants';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../../../store/Store';
import { ModeAudio } from './modes/ModeAudio';
import { MediaModes} from '../../../../models/Media.model';

export const MediaPanel = memo(({ loading }: { loading: boolean }) => {

    const mediaMode = useSelector(({ media }: GlobalState) => media.mode);

    // const toggleAction = (pressed: boolean, actionID: number) => {
    //     if (Date.now() >= virtualizedChains[currentIndex]![friend!.curChainIndex!].Created + DEFAULT_EXPIRE_TIME) {
    //         onHideActions();
    //         return;
    //     }
    //     let tempAction = -1;
    //     if (actionID != virtualizedChains[currentIndex]![friend!.curChainIndex!].Action && pressed) tempAction = actionID; else if (actionID == virtualizedChains[currentIndex]![friend!.curChainIndex!].Action && !pressed) tempAction = 0;
    //     if (tempAction == -1) return;
    //     sendAction(friend!.RelationID, friend!.ChainID, virtualizedChains[currentIndex]![friend!.curChainIndex!].MessageID, tempAction);
    //     dispatch(userActions.setAction({ index: friend!.curChainIndex, actionID: tempAction }));
    // }

    return (
        <ContainerView style={{ flexDirection: "row", alignItems: "center", height: ACTION_BAR_HEIGHT, borderBottomColor: "#2F2F2F", backgroundColor: "#343434", borderBottomWidth: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2, shadowColor: "#000", shadowOpacity: 0.34, shadowRadius: 6.27, elevation: 5 }}>
            <RippleTouch borderless borderRadius={25} opacity={0.2}>
                <View style={{ marginRight: 20, marginLeft: 20 }}>
                    <Icon source={LINE_MORE_ICON} style={{ tintColor: "#F0F0F0" }} dimensions={25} />
                </View>
            </RippleTouch>
            <ModeAnimatedView visible={mediaMode == MediaModes.DEFAULT} directionUp={true} >
                <Subtitle style={{ color: "#707070", fontSize: 12 }}>Messages expire in 60 days</Subtitle>
            </ModeAnimatedView>
            <ModeAnimatedView visible={mediaMode == MediaModes.AUDIO}>
                <ModeAudio />
            </ModeAnimatedView>
            {/* <Animated.FlatList
                data={ACTIONS_RESOURCE} 
                renderItem={renderIcons} 
                horizontal={true} 
                style={{ transform: [{ translateY: showActionsAnim }] }}
                removeClippedSubviews={true} 
                showsHorizontalScrollIndicator={false} 
                ListEmptyComponent={ <Subtitle style={{ color: "#808080" }}>Start chatting!</Subtitle> } 
                keyExtractor={(item, index) => index.toString()} 
                // getItemLayout={(data, index) => (
                //     { length: , offset:, index}
                // )}
            /> */}
        </ContainerView>
    )
}, areEqual);

function areEqual(prevProps: any, nextProps: any) {
    return prevProps.loading == nextProps.loading;
}

function ModeAnimatedView(props: View['props'] & { visible: boolean, directionUp?: boolean }) {
    const { style, visible, directionUp, ...otherProps } = props;
    const animationValue = useRef<Animated.Value>(new Animated.Value(visible ? 1 : 0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(
                animationValue,
                {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad)
                }
            ).start();
        } else {
            Animated.timing(
                animationValue,
                {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }
            ).start();
        }
    }, [visible]);

    return (
        <Animated.View 
            style={[{ 
                transform: [{ translateY: animationValue.interpolate({ inputRange: [0, 1], outputRange: directionUp ? [-10, 0] : [0, 10] }) }], 
                opacity: animationValue, 
                position: 'absolute', 
                flexGrow: 1, 
                marginLeft: 65, 
                flexDirection: "row", 
                justifyContent: 'center', 
                alignItems: 'center' 
            }, style]} {...otherProps}>
            {props.children}
        </Animated.View>
    )
}