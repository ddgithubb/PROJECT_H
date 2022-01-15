import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing } from 'react-native';
import { getChain } from '../../../services/Chains.service';
import { memo } from 'react';
import { getState, GlobalState } from '../../../store/Store';
import { useSelector } from 'react-redux';
import { ChainDisplay } from './components/ChainDisplay';
import { STATIC_ACTIVATOR_HEIGHT, CHAIN_HEIGHT } from '../../../config/constants';
import { InputPanel } from './components/InputPanel';
import { ActionBar } from './components/ActionBar';

var currentIndex = -1;

export const MemoizedChatActivator = memo(ChatActivator);

function ChatActivator() {
    const selectedIndex = useSelector(({ user }: GlobalState) => user.selectedUserKey );
    const myUserID = useSelector(({ user }: GlobalState) => user.userID );
    const [ loading, setLoading ] = useState(true);
    const transformAnim = useRef(new Animated.Value(STATIC_ACTIVATOR_HEIGHT)).current;
    const chainAnim = useRef(new Animated.Value(CHAIN_HEIGHT)).current;

    console.log("CHAT ACTIVATOR HAS RENDERED!!!!!!", selectedIndex, currentIndex);
    
    useEffect(() => {
        console.log("SELECTED INDEX")
        if (selectedIndex != -1) {
            onSelected();
            if (selectedIndex != currentIndex) {
                currentIndex = selectedIndex;
                getChainData();
            }
        } else {
            onUnselected()
        }
    }, [selectedIndex])

    const getChainData = async () => {
        if (!loading) setLoading(true);
        if (!getState().user.chains[currentIndex]) {
            await getChain(selectedIndex).then(() => {
                setLoading(false);
            });
        }
    } 

    const onSelected = async () => {
        Animated.timing(
        transformAnim,
        {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.exp)
        }
        ).start();
        Animated.spring(
        chainAnim,
        {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5
        }
        ).start();
        //AUDIO_REPLACE_ID
        // const { status: existingStatus } = await Audio.getPermissionsAsync();
        // let finalStatus = existingStatus;
        // if (existingStatus !== 'granted') {
        //     const { status } = await Audio.requestPermissionsAsync();
        //     finalStatus = status;
        // }
        // if (finalStatus !== 'granted') {
        //     onUnselected();
        // }
    }

    const onUnselected = async () => {
        Animated.timing(
        transformAnim,
        {
            toValue: STATIC_ACTIVATOR_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }
        ).start();
        Animated.timing(
        chainAnim,
        {
            toValue: CHAIN_HEIGHT,
            duration: 200,
            useNativeDriver: true
        }
        ).start();  
    }

    return (
        <Animated.View style={[{ position: "absolute", bottom: 0, transform: [{ translateY: transformAnim }], width: "100%" }]} >
            <Animated.View style={{ transform: [{ translateY: chainAnim }], flexDirection: "row", alignItems: "flex-end", paddingBottom: 10, justifyContent: "center", width: "100%" }}>
                <ChainDisplay />
            </Animated.View>
            <ActionBar loading={loading} />
            <InputPanel loading={loading} />
        </Animated.View>
    );
}