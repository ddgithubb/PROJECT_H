import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Animated, Easing, EmitterSubscription, LayoutChangeEvent, NativeEventEmitter, TouchableOpacity, View } from 'react-native';
import { DangerDotIndicator, Icon, InfoDotIndicator, Subtitle } from '../../../../../components/Generic.component';
import { ACTIONS_RESOURCE } from '../../../../../services/Resource.service';
import LinearGradient  from 'react-native-linear-gradient';
import { 
    DEFAULT_EXPIRE_TIME,
    METERING_INTERVAL_DURATION,
    MESSAGE_MAX_WIDTH,
    CHAIN_METERS_WIDTH,
    DISPLAY_DURATION_WIDTH,
} from '../../../../../config/constants';
import { memo } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { DANGER_COLOR } from '../../../../../Main.css';
import { formatDateIndicator, formatTime, millisToMinutesAndSeconds } from '../../../../../services/Time.service';
import { useDispatch, useSelector } from 'react-redux';
import { userActions } from '../../../../../store/slices/User.slice';
import { mediaActions } from '../../../../../store/slices/Media.slice';
import { CHAIN_HEIGHT, MESSAGE_HEIGHT, MESSAGE_SPACER } from '../../../../../config/constants';
import { MEDIA_CURRENT_POS_EVENT_EMITTER, CHAIN_METER_AMOUNTS } from '../../../../../services/Chat-activator.service';
import { getState, GlobalState } from '../../../../../store/Store';
import { Message } from '../../../../../models/User.model';
import { MediaModes } from '../../../../../models/Media.model';
import { ResponseMeters } from './ResponseMeters';

var curSeeking = false;

export const AudioMessage = memo(({ item, selected, isLastItem, lastSeen }: 
    {
        item: Message,
        selected: boolean,
        isLastItem: boolean,
        lastSeen: boolean,
    }
) => {

    const flatlistRef = useRef<any>();
    const myUserID = useSelector(({ user }: GlobalState) => user.userID );
    const [ loading, setLoading ] = useState(false);
    const [ currentPosition, setCurrentPosition ] = useState<{ position: number, seeking: boolean }>({ position: 0, seeking: false });
    const [ expired, setExpired ] = useState(Date.now() >= item.Created + DEFAULT_EXPIRE_TIME);
    const actionScaleAnim = useRef<Animated.Value>(new Animated.Value(0));
    const actionTransformYAnim = useRef<Animated.Value>(new Animated.Value(0));
    const playingAnim = useRef<Animated.Value>(new Animated.Value(1));
    const seekingAnim = useRef<Animated.Value>(new Animated.Value(1));
    const [ curActionID, setCurActionID ] = useState(0);
    const [ timeCreated, dateCreated, dateIndicator ] = useMemo(() => [ formatTime(item.Created), formatDateIndicator(item.Created), formatDateIndicator(item.dateIndicatorCreated) ], [item.Created]);
    const mediaEventListener = useRef<EmitterSubscription | undefined>(undefined);
    const initialRender = useRef<boolean>(true);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!initialRender.current) {
            setCurrentPosition({ position: 0, seeking: false });
            setExpired(Date.now() >= item.Created + DEFAULT_EXPIRE_TIME);
            actionScaleAnim.current = new Animated.Value(0);
            actionTransformYAnim.current = new Animated.Value(0);
            playingAnim.current = new Animated.Value(1);
            seekingAnim.current = new Animated.Value(1);
            initialRender.current = true;
        }
    }, [item.MessageID]);

    useEffect(() => {
        Animated.timing(
            actionTransformYAnim.current, 
            {
                toValue: 0,
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
                        toValue: -10,
                        duration: 50,
                        useNativeDriver: true,
                    }
                ).start();
            }
        });
    }, [item.Action]);

    useEffect(() => {
        return () => {
            if (mediaEventListener.current) mediaEventListener.current.remove()
        }
    }, []);

    useEffect(() => {
        //console.log("selected: ", selected)
        if (selected) {
            meterPlaying()
            let eventEmitter = new NativeEventEmitter();
            mediaEventListener.current = eventEmitter.addListener(MEDIA_CURRENT_POS_EVENT_EMITTER, (data) => {
                if (loading) setLoading(false);
                updatePosition(data);
            });
        } else {
            meterUnplaying()
            if (mediaEventListener.current) {
                mediaEventListener.current.remove();
                mediaEventListener.current = undefined;
            }
            flatlistRef.current.scrollToOffset({ offset: 0, animated: true });
            setCurrentPosition({ position: 0, seeking: false });
        }
    }, [selected])

    const meterPlaying = () => {
        Animated.timing(
            playingAnim.current, 
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            }
        ).start();
    }

    const meterUnplaying = () => {
        Animated.timing(
            playingAnim.current, 
            {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            }
        ).start();
        Animated.timing(
            seekingAnim.current,
            {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad)
            }
        ).start();
    }
    
    const selectMessage = async (messageID: string, userID: string, seen: boolean) => {
        if (Date.now() >= item.Created + DEFAULT_EXPIRE_TIME) {
            if (!expired) setExpired(true);
            return;
        }
        if (selected) {
            dispatch(mediaActions.resetPlaying(null));
        } else {
            setLoading(true);
            dispatch(mediaActions.setPlaying({ message: item, mode: MediaModes.AUDIO }));
            if (myUserID != userID && !seen) dispatch(userActions.setSeen({ index: getState().user.currentUserKey, messageID: messageID, seen: true }));
        }
    }

    const updatePosition = ({ position, seeking }: { position: number, seeking: boolean }) => {
        if (!seeking || position == 0) {
            flatlistRef.current.scrollToOffset({ offset: (Math.floor(position / METERING_INTERVAL_DURATION) * CHAIN_METERS_WIDTH), animated: true });
            if (curSeeking) {
                curSeeking = false;
                Animated.timing(
                    seekingAnim.current,
                    {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.quad)
                    }
                ).start();
            }
        } else if (seeking && !curSeeking) {
            curSeeking = true;
            Animated.timing(
                seekingAnim.current,
                {
                    toValue: 1.3,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad)
                }
            ).start();
        }
        setCurrentPosition({ position, seeking: curSeeking });
    }

    const renderMeters = ({ item, index }: any) => {
        return (
            <ResponseMeters item={item} seeked={selected && currentPosition.position > METERING_INTERVAL_DURATION * index} />
        )
    }

    return (
        <View style={{ flexDirection: "row", height: MESSAGE_HEIGHT, width: item.totalWidth }}>
            <LinearGradient 
                end={{ x: 1.3, y: 0.4 }} 
                colors={ selected ? ["#202020", "#202020"] : myUserID == item.UserID ? ["#3F3F3F", "#3F3F3F"] : ["#6D6DCB", "#4D70D0", "#4E8FCE"]} 
                style={{ 
                    borderTopRightRadius: 20, 
                    borderBottomRightRadius: 5, 
                    borderTopLeftRadius: 10, 
                    borderBottomLeftRadius: 25, 
                    height: MESSAGE_HEIGHT, 
                    marginHorizontal: (MESSAGE_SPACER / 2), 
                    width: item.totalWidth - item.dateIndicatorWidth - MESSAGE_SPACER
                 }}
                >
                <TouchableOpacity 
                    activeOpacity={0.5} 
                    disabled={loading} 
                    onPress={() => selectMessage(item.MessageID, item.UserID, item.Seen)} 
                    style={{ 
                        flexDirection: "row", 
                        opacity: loading ? 0.5 : 1, 
                        borderTopRightRadius: 20, 
                        borderBottomRightRadius: 5, 
                        borderTopLeftRadius: 10, 
                        borderBottomLeftRadius: 25, 
                        borderWidth: myUserID == item.UserID ? 1 : 0, 
                        borderColor: "#252525", 
                    }}
                    >
                    {
                        expired ? (
                            <DangerDotIndicator style={{ position: "absolute", bottom: 2, left: 0 }} />
                        ) : (
                            myUserID != item.UserID && !item.Seen ? (
                                <InfoDotIndicator style={{ position: "absolute", bottom: 2, left: 0 }} />
                            ) : undefined
                        )
                    }
                    <Animated.View style={{ 
                        transform: [
                            { translateY: playingAnim.current.interpolate({ inputRange: [0, 1], outputRange: [-MESSAGE_HEIGHT + 39, 0]}) },
                            { translateX: playingAnim.current.interpolate({ inputRange: [0, 1], outputRange: [-2, 0]}) },
                            { scale: playingAnim.current.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1]}) },
                            { scale: seekingAnim.current }
                        ],
                        position: "absolute", 
                        left: 0, 
                        width: DISPLAY_DURATION_WIDTH, 
                        paddingLeft: 10, 
                        alignSelf: "center"
                    }}>
                        <Subtitle 
                            style={{ 
                                color: "#F0F0F0", 
                                fontWeight: "bold", 
                                fontSize: 15, 
                            }}>
                            { millisToMinutesAndSeconds(currentPosition.position || item.Duration) }
                        </Subtitle>
                    </Animated.View>
                    <Animated.FlatList
                        data={item.Display}
                        renderItem={renderMeters} 
                        ref={flatlistRef} 
                        style={{ flexGrow: 1, transform: [{ translateY: playingAnim.current.interpolate({ inputRange: [0, 1], outputRange: [0, MESSAGE_HEIGHT / 2 - 3]}) }] }}
                        contentContainerStyle={{ opacity: currentPosition.seeking ? 0.25 : 1, paddingLeft: 50, height: MESSAGE_HEIGHT, alignItems: "center", paddingRight: MESSAGE_MAX_WIDTH }}
                        horizontal={true} 
                        removeClippedSubviews={true} 
                        showsHorizontalScrollIndicator={false} 
                        initialNumToRender={CHAIN_METER_AMOUNTS} 
                        maxToRenderPerBatch={1}
                        windowSize={2}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => index.toString()} 
                        getItemLayout={(data, index) => (
                            {length: CHAIN_METERS_WIDTH, offset: CHAIN_METERS_WIDTH * index, index}
                        )} 
                    /> 
                </TouchableOpacity>
                {
                    !selected ? (
                        <Subtitle style={{ color: "#C8C8C8", fontSize: 10, position: "absolute", alignSelf: "center" }}>{ timeCreated } <Subtitle style={{ fontWeight: "bold", color: DANGER_COLOR, fontSize: 10 }}>{ expired ? item.Display.length < 7 ? "E" : "EXPIRED" : "" }</Subtitle></Subtitle>
                    ) : undefined
                }
            </LinearGradient>
            {
                item.dateIndicatorCreated ?
                    <View style={{ height: MESSAGE_HEIGHT, width: item.dateIndicatorWidth, justifyContent: "center" }}>
                        <View style={{ width: item.dateIndicatorWidth, height: 3, backgroundColor: "#2A2A2A", borderRadius: 50, marginTop: 7 }} />
                        <View style={{ position: "absolute", right: 0, bottom: MESSAGE_HEIGHT / 2 - 8, width: 25, height: 2, backgroundColor: lastSeen && !isLastItem ? DANGER_COLOR : "#2F2F2F", borderRadius: 50 }} />
                        <View style={{ position: "absolute", bottom: MESSAGE_HEIGHT / 2 - 1, right: 1 }}>
                            <Subtitle style={{ fontSize: 13, fontWeight: "bold" }} >{ isLastItem ? "Today" : dateIndicator }</Subtitle>
                        </View>
                        <View style={{ position: "absolute", bottom: MESSAGE_HEIGHT / 2 - 17 }}>
                            <Subtitle style={{ fontSize: 9, fontWeight: "bold", color: "#4B4B4B" }} >{ dateCreated }</Subtitle>
                        </View>
                    </View>
                : lastSeen && !isLastItem ?
                    <View style={{ height: MESSAGE_HEIGHT, alignItems: "center", justifyContent: "center" }}>
                        <View style={{ position: "absolute", right: -3, height: 8, width: 6, backgroundColor: DANGER_COLOR, borderRadius: 50 }} />
                    </View>
                : undefined
            }
            <Animated.View style={{ position: "absolute", left: 5, transform: [{ scale: actionScaleAnim.current }, { translateY: actionTransformYAnim.current }] }}>
                <Icon source={ACTIONS_RESOURCE[curActionID > 0 && curActionID < ACTIONS_RESOURCE.length ? curActionID - 1 : 0]} /> 
            </Animated.View>
        </View>
    )
}, areEqual);

function areEqual(prevProps: any, nextProps: any) {
    return prevProps.item.MessageID == nextProps.item.MessageID && 
        prevProps.item.Action == nextProps.item.Action && 
        prevProps.selected == nextProps.selected && 
        prevProps.selected == nextProps.selected && 
        prevProps.item.Seen == nextProps.item.Seen && 
        prevProps.isLastItem == nextProps.isLastItem && 
        prevProps.lastSeen == nextProps.lastSeen;
}