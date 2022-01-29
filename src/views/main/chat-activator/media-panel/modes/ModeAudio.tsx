import React, { useEffect, useRef, useState } from 'react'
import { Animated, NativeEventEmitter, Pressable, View } from 'react-native';
import { ContainerView, Icon, RippleTouch, Subtitle } from '../../../../../components/Generic.component';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { getState, GlobalState, store } from '../../../../../store/Store';
import { Slider } from '@miblanchard/react-native-slider';
import { PAUSE_ICON, PLAY_ICON } from '../../../../../services/Resource.service';
import Video, { LoadError, OnProgressData } from 'react-native-video';
import { populateAuthHeaders, USER_PATH } from '../../../../../config/http';
import { getChainIDEndpoint } from '../../../../../services/Chains.service';
import { mediaActions } from '../../../../../store/slices/Media.slice';
import { MEDIA_CURRENT_POS_EVENT_EMITTER } from '../../../../../services/Chat-activator.service';
import { PIXEL_WIDTH } from '../../../../../config/dimensions';
import { METERING_INTERVAL_DURATION } from '../../../../../config/constants';

const eventEmitter = new NativeEventEmitter();
var currentPosition = 0;
var seekingToRateLimit = false;
var prevPositionIndex = 0;
var currentPositionIndex = 0;
var currentSeekValue = 0;
var prevSeekValue = 0;
var seekDelayTimeout = undefined;

function getValueFromSlideCallback(value: number | number[]) {
    return (!Array.isArray(value) && value) || value[0] || 0;
}

export const ModeAudio = memo(() => {

    const currentIndex = useSelector(({ user }: GlobalState) => user.currentUserKey);
    const mediaState = useSelector(({ media }: GlobalState) => media);
    const videoRef = useRef<Video>();
    const seekingAnim = useRef<Animated.Value>(new Animated.Value(0)).current;
    const [ curSlidePosition, setCurSlidePosition ]  = useState<number>(0);
    const [ isSeeking, setIsSeeking ] = useState<boolean>(false);
    const dispatch = store.dispatch;

    useEffect(() => {
        onReset();
        dispatch(mediaActions.resetPlaying(null));
    }, [currentIndex]);

    useEffect(() => {
        if (!mediaState.curPlayingMessage) onReset();
    }, [mediaState.curPlayingMessage]);

    useEffect(() => {
        if (isSeeking) {
            Animated.timing(
                seekingAnim,
                {
                    toValue: 0.65,
                    duration: 80,
                    useNativeDriver: true,
                }
            ).start();
        } else {
            Animated.timing(
                seekingAnim,
                {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: true,
                }
            ).start();
        }
    }, [isSeeking]);

    const seekStart = (value: number | number[]) => {
        seekDelayTimeout = setTimeout(() => {
            setIsSeeking(true);
        }, 100);
    }

    const seekComplete = (value: number | number[]) => {
        if (!isSeeking) {
            clearTimeout(seekDelayTimeout);
            dispatch(mediaActions.togglePlay(null));
            return;
        }
        currentSeekValue = getValueFromSlideCallback(value);
        videoRef.current.seek((currentSeekValue * mediaState.curPlayingMessage.Duration / 1000));
        eventEmitter.emit(MEDIA_CURRENT_POS_EVENT_EMITTER, {
            position: (currentSeekValue * mediaState.curPlayingMessage.Duration),
            seeking: false
        });
        setCurSlidePosition(currentSeekValue);
        if (isSeeking) setIsSeeking(false);
    }

    const seekingTo = (value: number | number[]) => {
        if (!isSeeking) return;
        currentSeekValue = getValueFromSlideCallback(value);
        if (!seekingToRateLimit && currentSeekValue != prevSeekValue) {
            seekingToRateLimit = true;
            eventEmitter.emit(MEDIA_CURRENT_POS_EVENT_EMITTER, {
                position: (currentSeekValue * mediaState.curPlayingMessage.Duration),
                seeking: true
            });
            prevSeekValue = currentSeekValue;
            setTimeout(() => seekingToRateLimit = false, 100);
        }
    }

    const onError = (error: LoadError) => {
        //modify expiresAt to make it automatically expire
        onReset();
        dispatch(mediaActions.resetPlaying(null));
    }

    const onReset = () => {
        currentPosition = 0;
        prevPositionIndex = 0;
        currentPositionIndex = 0;
        if (mediaState.isPlaying) dispatch(mediaActions.pausePlaying(null));
        eventEmitter.emit(MEDIA_CURRENT_POS_EVENT_EMITTER, {
            position: 0,
            seeking: true,
        });
        setCurSlidePosition(0);
        if (isSeeking) setIsSeeking(false);
    }

    const onProgress = (data: OnProgressData) => {
        currentPosition = data.currentTime * 1000;
        currentPositionIndex = Math.floor(currentPosition / METERING_INTERVAL_DURATION) + 1;
        if (currentPositionIndex != prevPositionIndex) {
            eventEmitter.emit(MEDIA_CURRENT_POS_EVENT_EMITTER, {
                position: currentPosition || 1,
                seeking: false
            });
            setCurSlidePosition((currentPosition + METERING_INTERVAL_DURATION) / mediaState.curPlayingMessage.Duration);
            prevPositionIndex = currentPositionIndex;
        }
    }

    return (
        <>
        {
            mediaState.curPlayingMessage ? 
                <Video 
                    source={{
                        uri: USER_PATH + getChainIDEndpoint(currentIndex) + "/audio/" + mediaState.curPlayingMessage.MessageID + "?seen=" + (mediaState.curPlayingMessage.UserID == getState().user.userID ? true : mediaState.curPlayingMessage.Seen),
                        headers: populateAuthHeaders({ headers: {} }, false).headers
                    }} 
                    audioOnly
                    ref={videoRef}
                    onError={onError}
                    onProgress={onProgress}
                    onEnd={onReset}
                    paused={!mediaState.isPlaying || isSeeking}
                    progressUpdateInterval={50}
                    bufferConfig={{
                        minBufferMs: 5000,
                        maxBufferMs: 120000,
                        bufferForPlaybackMs: 2500,
                        bufferForPlaybackAfterRebufferMs: 5000
                    }}
                    style={{ width: 0, height: 0 }}
                /> : undefined
        }
        <Slider 
            animateTransitions
            containerStyle={{ width: Math.max(100, PIXEL_WIDTH - 200 ) }}
            minimumTrackTintColor='#E04444'
            maximumTrackTintColor='#565656'
            trackStyle={{ height: 2 }}
            value={curSlidePosition}
            onValueChange={seekingTo}
            onSlidingComplete={seekComplete}
            onSlidingStart={seekStart}
            trackClickable={false}
            renderThumbComponent={() => 
                <Animated.View
                    style={{ 
                        width: 27, 
                        aspectRatio: 1,
                        borderRadius: 50, 
                        backgroundColor: mediaState.isPlaying ? "#343434" :  "#EAEAEA", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        borderWidth: mediaState.isPlaying ? 1 : 0, 
                        borderColor: "#AAAAAA",
                        transform: [{ scale: seekingAnim }]
                    }}
                >
                    {
                        !isSeeking ? <Icon source={mediaState.isPlaying ? PAUSE_ICON : PLAY_ICON } dimensions={15} tint={mediaState.isPlaying ? "#EAEAEA" : "#343434" } /> : undefined
                    }
                </Animated.View>
            }
        />
        <ScrollView
            style={{ flexGrow: 1 }}
            contentContainerStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingLeft: 10 }}
            horizontal
            removeClippedSubviews 
        >
        </ScrollView>
        </>
    )
});