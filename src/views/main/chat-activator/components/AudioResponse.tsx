import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Animated, Easing, LayoutChangeEvent, TouchableOpacity, View } from 'react-native';
import { DangerDotIndicator, Icon, InfoDotIndicator, Subtitle } from '../../../../components/Generic.component';
import { ACTIONS_RESOURCE } from '../../../../services/Resource.service';
import LinearGradient  from 'react-native-linear-gradient';
import { 
    DEFAULT_EXPIRE_TIME,
    METERING_INTERVAL_DURATION,
    INITIAL_CLIP_TIME,
    CLIP_LENGTH,
    CLIP_ACCURACY,
    DATE_INDICATOR_WIDTH,
    MESSAGE_MAX_WIDTH,
    CHAIN_METERS_WIDTH,
} from '../../../../config/constants';
import { memo } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { somethingWrong } from '../../../../services/Errors.service';
import { DANGER_COLOR } from '../../../../Main.css';
import { formatDateIndicator, formatTime, millisToMinutesAndSeconds } from '../../../../services/Time.service';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../../../store/slices/User.slice';
import { sendGetAudio } from '../../../../services/Websocket-send.service';
import { audioActions } from '../../../../store/slices/Audio.slice';
import { CHAIN_HEIGHT, MESSAGE_HEIGHT, MESSAGE_SPACER } from '../../../../config/constants';
import { METER_AMOUNTS } from '../../../../services/Chat-activator.service';
import { getState, GlobalState } from '../../../../store/Store';

var audioRes: any[] = [];
var prevSoundDurations: number;
var expectedMeteringPosition: number;
var syncIndexPosition: number;
// var audioClips: Audio.Sound[] = []; AUDIO_REPLACE_ID
var curPlayingChainID: string = "";
var playingIndex: number = -1;

export const AudioResponse = memo(({ item, chainID, selected, isPlaying, isLastItem, lastSeen }: any) => {

    const flatlistRef = useRef<any>();
    const myUserID = useSelector(({ user }: GlobalState) => user.userID );
    const [ loading, setLoading ] = useState(false);
    const [ currentPosition, setCurrentPosition ] = useState<{position: number, index: number}>({ position: item.Duration, index: 0 });
    const [ forceExpire, setForceExpire ] = useState(false);
    const actionScaleAnim = useRef<Animated.Value>(new Animated.Value(0));
    const actionTransformYAnim = useRef<Animated.Value>(new Animated.Value(10));
    const metersTransformYAnim = useRef<Animated.Value>(new Animated.Value(MESSAGE_HEIGHT / 2 - 3));
    const [ curActionID, setCurActionID ] = useState(0);
    const [ timeCreated, dateCreated, dateIndicator ] = useMemo(() => [ formatTime(item.Created), formatDateIndicator(item.Created), formatDateIndicator(item.dateIndicator) ], [item.Created]);
    const dispatch = useDispatch();

    useEffect(() => {
        setCurrentPosition({ position: item.Duration, index: 0 });
        setForceExpire(false);
        actionScaleAnim.current = new Animated.Value(0);
        actionTransformYAnim.current = new Animated.Value(10);
        metersTransformYAnim.current = new Animated.Value(MESSAGE_HEIGHT / 2 - 3);
    }, [item.MessageID]);

    useEffect(() => {
        Animated.timing(
            actionTransformYAnim.current, 
            {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }
        ).start();
        Animated.timing(
            actionScaleAnim.current,
            {
                toValue: 0,
                duration: 80,
                useNativeDriver: true,
            }
        ).start(() => {
            if (item.Action != 0) {
                setCurActionID(item.Action);
                Animated.timing(
                    actionScaleAnim.current,
                    {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true,
                    }
                ).start();
                Animated.timing(
                    actionTransformYAnim.current, 
                    {
                        toValue: 0,
                        duration: 50,
                        useNativeDriver: true,
                    }
                ).start();
            }
        });
    }, [item.Action]);

    useEffect(() => {
        //console.log("isPlaying: ", isPlaying)
        if (isPlaying) meterPlaying(); else meterUnplaying();
    }, [isPlaying])

    useEffect(() => {
        //console.log("selected: ", selected)
        if (!selected) {
            audioRes = [];
            flatlistRef.current.scrollToIndex({ index: 0, animated: true });
            setCurrentPosition({ position: item.Duration, index: 0 });
        }
    }, [selected])

    const meterPlaying = () => {
        Animated.timing(
            metersTransformYAnim.current, 
            {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
                easing: Easing.ease
            }
        ).start();
    }

    const meterUnplaying = () => {
        Animated.timing(
            metersTransformYAnim.current, 
            {
                toValue: MESSAGE_HEIGHT / 2 - 3,
                duration: 50,
                useNativeDriver: true,
                easing: Easing.ease
            }
        ).start();
    }
    
    const startPlayingClips = async (messageID: string, userID: string, duration: number, seen: boolean) => {
        if (Date.now() >= item.Created + DEFAULT_EXPIRE_TIME || forceExpire) {
            if (!forceExpire) setForceExpire(true);
            return;
        }
        if (playingIndex != -1 && selected) {
            if (isPlaying) {
                dispatch(audioActions.setPause(undefined))
            //    await audioClips[playingIndex].pauseAsync(); AUDIO_REPLACE_ID
            } else {
                dispatch(audioActions.setResume(undefined))
            //    await audioClips[playingIndex].playAsync(); AUDIO_REPLACE_ID
            }
        } else {
            setLoading(true);
            dispatch(audioActions.setPlaying(item.MessageID))
            await unloadClips();
            prevSoundDurations = 0;
            expectedMeteringPosition = 0;
            syncIndexPosition = 0;
            playingIndex = 0;
            if (myUserID != userID && !seen) dispatch(userActions.setSeen({ index: getState().user.currentUserKey, messageID: messageID, seen: true }));
            await playAudioClip(duration, messageID, userID, 0, seen);
            // if (playingIndex != -1) await audioClips[0].playAsync(); AUDIO_REPLACE_ID
            setLoading(false);
        }
    }

    const getSound = async (chainID: string, messageID: string, level: number, seen: boolean, userID: string) => {
        // let sound = new Audio.Sound(); AUDIO_REPLACE_ID
        // if (!audioRes[level] || chainID != curPlayingChainID) {
        //     console.log("NOT SAVED")
        //     audioRes[level] = await sendGetAudio(chainID, messageID, level, seen, userID);
        //     if (audioRes[level] == "no response") {
        //         somethingWrong("no response");
        //     }
        //     curPlayingChainID = chainID;
        // }
        // try {
        //     await sound.loadAsync({ uri: audioRes[level] });
        // } catch(e) {
        //     if (!forceExpire) setForceExpire(true);
        // }
        // return sound;
    }
    
    const playAudioClip = async (totalDuration: number, messageID: string, userID: string, level: number, seen: boolean) => { 
        let gotNext = false;
        let playingNext = false;
        let clipDuration = level == 0 ? INITIAL_CLIP_TIME : level * CLIP_LENGTH + CLIP_ACCURACY;
        // if (!audioClips[level]) { AUDIO_REPLACE_ID
        //     await getSound(chainID, messageID, level, seen, userID).then((sound) => {
        //         console.log("responded", level);
        //         audioClips[level] = sound;
        //     });
        // }
        // if (!audioClips[level]._loaded) {
        //     console.log("NOT LOADED")
        //     unloadClips();
        //     resetClips();
        //     return;
        // }
        // if (totalDuration > clipDuration) {
        //     await audioClips[level].setProgressUpdateIntervalAsync(1);
        //     audioClips[level].setOnPlaybackStatusUpdate(async (status: any) => {
        //         if (!playingNext) {
        //             updatePosition(totalDuration, status.positionMillis)
        //         }
        //         if (!playingNext && status.positionMillis >= status.durationMillis - 1) { 
        //             playingNext = true;
        //             playingIndex = level + 1;
        //             updatePosition(totalDuration, status.durationMillis)
        //             prevSoundDurations += status.durationMillis;
        //             try {
        //                 await audioClips[level + 1]?.playAsync();
        //                 audioClips[level].unloadAsync();
        //             } catch(e) {
        //                 setLoading(true);
        //                 audioClips[level].unloadAsync();
        //                 let interval = setInterval(() => {
        //                     if (audioClips[level + 1]) {
        //                         clearInterval(interval)
        //                         setLoading(false);
        //                         if (playingIndex != -1) audioClips[level + 1]?.playAsync()
        //                     }
        //                 }, 10);
        //             }
        //         }
        //         if (!gotNext && status.positionMillis >= status.durationMillis - 60000) {
        //             gotNext = true;
        //             playAudioClip(totalDuration, messageID, userID, level + 1, seen);
        //         }
        //     })
        // } else {
        //     await audioClips[level].setProgressUpdateIntervalAsync(100);
        //     audioClips[level].setOnPlaybackStatusUpdate(async (status: any) => {
        //         if (syncIndexPosition <= item.Display.length) {
        //             updatePosition(totalDuration, status.positionMillis)
        //         }
        //         if (status.didJustFinish) { 
        //             resetClips();
        //         }
        //     })
        // }
    }

    const updatePosition = (totalDuration: number, positionMillis: number) => {
        if (syncIndexPosition < item.Display.length && positionMillis + prevSoundDurations >= expectedMeteringPosition) {
            expectedMeteringPosition += METERING_INTERVAL_DURATION;
            flatlistRef.current.scrollToIndex({ index: syncIndexPosition, animated: true, viewPosition: 0.1 })
            setCurrentPosition({ position: totalDuration - (positionMillis + prevSoundDurations), index: ++syncIndexPosition }) 
        } 
    }

    const resetClips = async () => {
        // if (playingIndex != -1) { AUDIO_REPLACE_ID
        //     try {
        //         audioClips[playingIndex].unloadAsync();
        //     } catch(e) {}
        //     playingIndex = -1;
        // }
        if (loading) setLoading(false);
        dispatch(audioActions.setPause(undefined))
        flatlistRef.current.scrollToIndex({ index: 0, animated: true });
        setCurrentPosition({ position: item.Duration, index: 0 });
    }

    const unloadClips = async () => {
        // for (let i = 0; i < audioClips.length; i++) { AUDIO_REPLACE_ID
        //     console.log("UNLOADING: ", i)
        //     try {
        //         await audioClips[i].unloadAsync();
        //     } catch(e) {}
        // }
        // audioClips = [];
        // playingIndex = -1;
    }

    const renderMeters = ({ item, index }: any) => {
        return (
            <ResponseMeters item={item} seeked={index < currentPosition.index} />
        )
    }

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: CHAIN_HEIGHT, width: item.totalWidth }}>
            <View style={{ height: MESSAGE_HEIGHT, marginHorizontal: (MESSAGE_SPACER / 2), maxWidth: MESSAGE_MAX_WIDTH }}> 
                <LinearGradient end={{ x: 1.3, y: 0.4 }} colors={ isPlaying ? ["#303030", "#303030"] : myUserID == item.UserID ? ["#3F3F3F", "#3F3F3F"] : ["#6D6DCB", "#4D70D0", "#4E8FCE"]} style={{ borderTopRightRadius: 20, borderBottomRightRadius: 5, borderTopLeftRadius: 10, borderBottomLeftRadius: 25 }}>
                    <TouchableOpacity activeOpacity={0.5} disabled={loading} onPress={() => startPlayingClips(item.MessageID, item.UserID, item.Duration, item.Seen)} style={{ flexDirection: "row", opacity: loading ? 0.5 : 1, borderTopRightRadius: 20, borderBottomRightRadius: 5, borderTopLeftRadius: 10, borderBottomLeftRadius: 25, borderWidth: myUserID == item.UserID ? 1 : 0, borderColor: "#252525" }}>
                        {
                            forceExpire ? (
                                <DangerDotIndicator style={{ position: "absolute", bottom: 2, left: 0 }} />
                            ) : (
                                myUserID != item.UserID && !item.Seen ? (
                                    <InfoDotIndicator style={{ position: "absolute", bottom: 2, left: 0 }} />
                                ) : undefined
                            )
                        }
                        <Subtitle style={{ color: "#F0F0F0", alignSelf: "center", position: "absolute", left: 0, fontWeight: "bold", fontSize: 15, paddingLeft: 10, width: 50 }}>{ millisToMinutesAndSeconds(currentPosition.position) }</Subtitle>
                        <Animated.View style={{ flexGrow: 1, transform: [{ translateY: metersTransformYAnim.current }] }}>
                            <FlatList
                                data={item.Display}
                                renderItem={renderMeters} 
                                ref={flatlistRef} 
                                style={{ marginLeft: 50 }} 
                                contentContainerStyle={{ height: MESSAGE_HEIGHT, alignItems: "center", paddingRight: 10 }}
                                horizontal={false} 
                                removeClippedSubviews={true} 
                                showsHorizontalScrollIndicator={false} 
                                initialNumToRender={METER_AMOUNTS} 
                                maxToRenderPerBatch={5}
                                windowSize={1}
                                scrollEnabled={false}
                                keyExtractor={(item, index) => index.toString()} 
                                getItemLayout={(data, index) => (
                                    {length: CHAIN_METERS_WIDTH, offset: CHAIN_METERS_WIDTH * index, index}
                                )} 
                            /> 
                        </Animated.View> 
                    </TouchableOpacity>
                </LinearGradient>
                {
                    !isPlaying ? (
                        <Subtitle style={{ color: "#C8C8C8", fontSize: 10, position: "absolute", alignSelf: "center" }}>{ timeCreated } <Subtitle style={{ fontWeight: "bold", color: DANGER_COLOR, fontSize: 10 }}>{ (Date.now() >= item.Created + DEFAULT_EXPIRE_TIME || forceExpire) ? item.Display.length < 7 ? "E" : "EXPIRED" : "" }</Subtitle></Subtitle>
                    ) : undefined
                }
            </View>
            {
                item.dateIndicator ?
                    <View style={{ height: MESSAGE_HEIGHT, width: DATE_INDICATOR_WIDTH, justifyContent: "center" }}>
                        <View style={{ width: DATE_INDICATOR_WIDTH, height: 3, backgroundColor: "#2A2A2A", borderRadius: 50, marginTop: 7 }} />
                        <View style={{ position: "absolute", right: 0, bottom: MESSAGE_HEIGHT / 2 - 8, width: 25, height: 2, backgroundColor: lastSeen && !isLastItem ? DANGER_COLOR : "#2F2F2F", borderRadius: 50 }} />
                        <View style={{ position: "absolute", bottom: MESSAGE_HEIGHT / 2 - 1, right: 1 }}>
                            <Subtitle style={{ fontSize: 13, fontWeight: "bold" }} >{ isLastItem ? "Today" : dateIndicator }</Subtitle>
                        </View>
                        <View style={{ position: "absolute", bottom: MESSAGE_HEIGHT / 2 - 17 }}>
                            <Subtitle style={{ fontSize: 9, fontWeight: "bold", color: "#4B4B4B" }} >{ dateCreated }</Subtitle>
                        </View>
                    </View>
                : undefined
            }
            {
                lastSeen && !isLastItem && !item.dateIndicators ?
                    <View style={{ position: "absolute", right: -2, bottom: (MESSAGE_HEIGHT - 35) / 2, height: 35, width: 3, backgroundColor: DANGER_COLOR, borderRadius: 50 }} />
                : undefined
            }
            <Animated.View style={{ position: "absolute", left: 5, top: 5, transform: [{ scale: actionScaleAnim.current }, { translateY: actionTransformYAnim.current }] }}>
                <Icon source={ACTIONS_RESOURCE[curActionID > 0 && curActionID < ACTIONS_RESOURCE.length ? curActionID - 1 : 0]} />
            </Animated.View>
        </View>
    )
}, areEqual);

function areEqual(prevProps: any, nextProps: any) {
    return prevProps.item.MessageID == nextProps.item.MessageID && 
        prevProps.item.Action == nextProps.item.Action && 
        prevProps.selected == nextProps.selected && 
        prevProps.isPlaying == nextProps.isPlaying && 
        prevProps.item.Seen == nextProps.item.Seen && 
        prevProps.isLastItem == nextProps.isLastItem && 
        prevProps.lastSeen == nextProps.lastSeen;
}

const ResponseMeters = memo(({ item, seeked }: any) => {

    const seekedAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (seeked) {
            Animated.timing(
            seekedAnim,
            {
                toValue: 0.1,
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
        <Animated.View style={{ transform: [{ scaleY: seekedAnim }], width: CHAIN_METERS_WIDTH - 1, borderRadius: 50, marginRight: 1, backgroundColor: "rgb(240,240,240)", height: Math.floor((item/100) * (MESSAGE_HEIGHT - 15)) + 7 }} />
    )
}, checkSeeked);

function checkSeeked(prevProps: any, nextProps: any) {
    return prevProps.seeked == nextProps.seeked && prevProps.item == nextProps.item;
}