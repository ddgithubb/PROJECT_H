import React, { useRef } from 'react'
import { Animated, Pressable, View } from 'react-native';
import { ContainerView, Icon, RippleTouch, Subtitle } from '../../../../components/Generic.component';
import { ACTIONS_RESOURCE, LINE_MORE_RESOURCE } from '../../../../services/Resource.service';
import { memo } from 'react';
import { ACTION_BAR_HEIGHT } from '../../../../config/constants';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../../../store/Store';

export const ActionBar = memo(({ loading }: any) => {

    //disableAction along with loading functionality
    const showActionsAnim = useRef(new Animated.Value(ACTION_BAR_HEIGHT)).current;
    const showExpireInfoAnim = useRef(new Animated.Value(0)).current;
    const currentIndex = useSelector(({ user }: GlobalState) => user.currentUserKey);
    // const isNewest = useSelector(({ user }: GlobalState) => user.chains[currentIndex].isNewest); THIS DOENS" TWORK, USE SHALLOW FN?

    const onShowActions = () => {
        Animated.spring(
        showActionsAnim,
        {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5
        }
        ).start();
        Animated.timing(
        showExpireInfoAnim,
        {
            toValue: ACTION_BAR_HEIGHT,
            duration: 100,
            useNativeDriver: true
        }
        ).start();  
    }

    const onHideActions = () => {
        Animated.timing(
        showActionsAnim,
        {
            toValue: ACTION_BAR_HEIGHT,
            duration: 100,
            useNativeDriver: true
        }
        ).start();   
        Animated.timing(
        showExpireInfoAnim,
        {
            toValue: 0,
            duration: 100,
            useNativeDriver: true
        }
        ).start();  
    }

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

    const renderIcons = ({ item, index }: any) => {
        return (
            <View></View>
            // <PushView style={{marginHorizontal: 12, height: 30, width: 30 }} duration={50} pressed={selectedIndex != -1 && virtualizedChains[currentIndex] ? index + 1 == virtualizedChains[currentIndex]![friend!.curChainIndex!]?.Action : false} action={(pressed: boolean) => toggleAction(pressed, index + 1)}>
            //     <Icon source={item} dimensions={27} />
            // </PushView>
        )
    }
    
    return (
        <ContainerView style={{ flexDirection: "row", alignItems: "center", height: ACTION_BAR_HEIGHT, borderBottomColor: "#2F2F2F", backgroundColor: "#343434", borderBottomWidth: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2, shadowColor: "#000", shadowOpacity: 0.34, shadowRadius: 6.27, elevation: 5 }}>
            <Animated.View style={{ position: 'absolute', transform: [{ translateY: showExpireInfoAnim }], justifyContent: 'center', alignItems: 'center', width: "100%" }}>
                <Subtitle style={{ color: "#707070", fontSize: 12 }}>Messages expire in 60 days</Subtitle>
            </Animated.View>
            <RippleTouch borderless borderRadius={25} opacity={0.2}>
                <View style={{ marginRight: 20, marginLeft: 20 }}>
                    <Icon source={LINE_MORE_RESOURCE} style={{ tintColor: "#F0F0F0" }} />
                </View>
            </RippleTouch>
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