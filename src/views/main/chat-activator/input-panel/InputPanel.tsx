import React, { useState, useEffect, useRef } from 'react'
import { Animated, Easing, TouchableOpacity, View } from 'react-native';
import { ContainerView, DangerText, Icon, RippleTouch, Subtitle } from '../../../../components/Generic.component';
import { sendAudio } from '../../../../services/Chains.service';
import { 
    METERING_INTERVAL_DURATION,
} from '../../../../config/constants';
import { memo } from 'react';
import { somethingWrong } from '../../../../services/Errors.service';
import { getState } from '../../../../store/Store';
import { FlatList } from 'react-native-gesture-handler';
import { FadeInOutView } from '../../../../components/Animation.components';
import { SEND_ICON, SEND_DISABLED_ICON, CANCEL_ICON, VOICE_WAVES_ICON } from '../../../../services/Resource.service';
import { millisToMinutesAndSeconds } from '../../../../services/Time.service';
import { PIXEL_WIDTH } from '../../../../config/dimensions';
import { METERS_WIDTH } from '../../../../services/Chat-activator.service';
import { INPUT_PANEL_HEIGHT } from '../../../../config/constants';
import { DANGER_COLOR } from '../../../../Main.css';
import { Audio } from 'expo-av';
import { deleteAsync } from 'expo-file-system';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { Meters } from './InputMeters';

const SIDEBAR_WIDTH = 60;
var recordingInstance: Audio.Recording | undefined = undefined;
var recording: boolean = false;
var recordedFile: string = "";
var recordedDuration: number = -1;
var curDuration: number = 0;
var tooShort = true;
var meters: number[] = [];
var expectedNextMeter: number;
var calculatedPowerIntensity: number = 0;
var errorInterval: any = undefined;

export const InputPanel = memo(({ loading }: { loading: boolean }) => {

    const [ recorded, setRecorded ] = useState(false);
    const [ maxLimit, setMaxLimit ] = useState(false);
    const [ errorText, setErrorText ] = useState("");
    const [ display, setDisplay ] = useState<number[]>([]);
    const [ disableAction, setDisableAction ] = useState(true);
    const flatlistRef = useRef<any>();
    const recordingBarAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

    useEffect(() => {
        prepareRecord();
    }, []);

    useEffect(() => {
        if (loading) {
            if (!disableAction) setDisableAction(true);
            if (recordingInstance && recorded) {
                resetRecord();
            }
        } else {
            if (disableAction) setDisableAction(false);
        }
    }, [loading]);

    const send = async () => {
        setDisableAction(true);
        await stopRecord()
        //////////////////////////
        // let sound = new Audio.Sound();
        // await sound.loadAsync({ uri: recordedFile });
        // await sound.playAsync();
        //////////////////////////////
        await sendAudio(getState().user.currentUserKey, meters, recordedFile, recordedDuration).then((res) => {
            if (res.Error) {
                setError("Something went wrong!");
            }
        });
        deleteAsync(recordedFile);
        maxLimit ? setMaxLimit(false) : undefined;
        setRecorded(false);
        await prepareRecord();
        setDisableAction(false);
    }

    const prepareRecord = async () => {
        meters = [];
        tooShort = true;
        expectedNextMeter = METERING_INTERVAL_DURATION;
        curDuration = 0;
        if (!recordingInstance) {
            recordingInstance = new Audio.Recording();
            try {
                await recordingInstance!.prepareToRecordAsync(
                    {
                            isMeteringEnabled: true,
                            android: {
                                extension: ".aac",
                                outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
                                audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_HE_AAC,
                                sampleRate: 44100,
                                bitRate: 48000,
                                numberOfChannels: 1,
                            },
                            ios: {
                                extension: ".aac",
                                outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC_HE_V2,
                                audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
                                sampleRate: 44100,
                                bitRate: 48000,
                                numberOfChannels: 1,
                            },
                            web: {}
                    });
                    recordingInstance!.setOnRecordingStatusUpdate(updateFunction);
                    recordingInstance!.setProgressUpdateInterval(50);
            } catch (err) {
                somethingWrong(err);
            }
        }
    }

    const updateFunction = async (status: Audio.RecordingStatus) => {
        if (status.isRecording) {
            if (status.durationMillis < 5 * 60000) {
                if (status.durationMillis >= expectedNextMeter) {
                    tooShort = false;
                    curDuration = status.durationMillis;
                    expectedNextMeter += METERING_INTERVAL_DURATION;
                    calculatedPowerIntensity = Math.ceil(Math.pow(10, status.metering! / 60) * 100);
                    meters.push(calculatedPowerIntensity);
                    setDisplay([...meters]);
                    flatlistRef.current.scrollToEnd();
                }
            } else {
                try {
                    await recordingInstance!.pauseAsync();
                } catch(err) {
                    somethingWrong(err);
                }
                setMaxLimit(true);
                setError("MAX LIMIT")
                recording = false;
            }
        }
    }

    const record = () => {
        if (!recording) {
            ReactNativeHapticFeedback.trigger("impactLight", {
                enableVibrateFallback: true,
                ignoreAndroidSystemSettings: true
            });
            Animated.timing(recordingBarAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
            if (!recorded) setRecorded(true);
            recording = true;
            requestAnimationFrame(async () => {
                //Prevent spam Using setInterval refresh like setError
                try {
                    recordingInstance!.startAsync();
                } catch(err) {
                    somethingWrong(err);
                }
            });
        }  
    }

    const pauseRecord = async () => {
        if (recording) {
            Animated.timing(recordingBarAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            }).start();
            if (recordingInstance) {
                recording = false;
                if (tooShort) {
                    await resetRecord();
                } else {
                    requestAnimationFrame(() => {
                        try {
                            recordingInstance!.pauseAsync();
                        } catch(err) {
                            somethingWrong(err);
                        }
                    });
                }
            } else {
                await resetRecord();
            }
        }
    }

    const stopRecord = async () => {
        try {
            await recordingInstance!.stopAndUnloadAsync();
            recordedFile = recordingInstance!.getURI()!;
            recordedDuration = recordingInstance!._finalDurationMillis;
            recordingInstance = undefined;
        } catch(err) {
            somethingWrong(err);
        }
    }

    const deleteRecord = async () => {
        try {
            await stopRecord();
            deleteAsync(recordedFile);
        } catch(err) {
            await recordingInstance?._cleanupForUnloadedRecorder({durationMillis: 0} as any);
            recordingInstance = undefined;
        }
    }

    const resetRecord = async () => {
        setDisableAction(true);
        setRecorded(false);
        setDisplay([]);
        if (maxLimit) setMaxLimit(false);
        await deleteRecord();
        await prepareRecord();
        setDisableAction(false);
    }

    const setError = (err: string) => {
        clearInterval(errorInterval);
        if (err != errorText) setErrorText(err)
        errorInterval = setTimeout(() => {
            setErrorText("");
        }, 3000);
    }

    const renderMeters = ({ item }: any) => {
        return (
            <Meters item={item} />
        )
    }

    return (
        <ContainerView style={{ height: INPUT_PANEL_HEIGHT, flexDirection: "row", backgroundColor: "#3A3A3A" }}>
            <View style={{
                marginLeft: 10,
                paddingVertical: 10, 
                height: INPUT_PANEL_HEIGHT, 
                width: PIXEL_WIDTH - SIDEBAR_WIDTH - 10, 
                backgroundColor: "rgba(58,58,58,1)",
                alignItems: "center", 
                justifyContent: "center", 
            }}>
                <FadeInOutView visible={!recorded} style={{ position: "absolute" }} >
                    <Icon source={VOICE_WAVES_ICON} tint={"#DDDDDD"} dimensions={30} /> 
                </FadeInOutView>
                <TouchableOpacity
                    disabled={maxLimit || disableAction} 
                    onPressIn={record} 
                    onPressOut={pauseRecord} 
                    delayPressIn={0} 
                    activeOpacity={0.3}
                    style={{ 
                        flexGrow: 1,
                        alignItems: "center", 
                        justifyContent: "center", 
                        borderWidth: 2, 
                        borderRadius: 5, 
                        borderColor: "rgba(90,90,90,1)",
                    }}
                    >
                        <FlatList
                            data={recorded ? display : []}
                            renderItem={renderMeters} 
                            ref={flatlistRef} 
                            contentContainerStyle={{ paddingRight: 10, height: "100%", flexGrow: 1, alignItems: "center", paddingVertical: 2, justifyContent: "flex-start" }}
                            horizontal={true} 
                            removeClippedSubviews={true} 
                            showsHorizontalScrollIndicator={false}  
                            maxToRenderPerBatch={5} 
                            windowSize={1} 
                            scrollEnabled={false}
                            keyExtractor={(item, index) => index.toString()} 
                            getItemLayout={(data, index) => (
                                { length: METERS_WIDTH, offset: METERS_WIDTH * index, index }
                            )}
                        />
                </TouchableOpacity>
                <Animated.View style={{ transform: [{ scaleX: recordingBarAnim }], position: "absolute", width: (PIXEL_WIDTH - SIDEBAR_WIDTH) / 2, top: 10, borderRadius: 1, height: 4, backgroundColor: "#46B180" }} />
            </View>
            <FadeInOutView visible={errorText != ""} style={{ position: "absolute", bottom: 18, left: 10, width: PIXEL_WIDTH - SIDEBAR_WIDTH, flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                <DangerText style={{ fontWeight: 'bold', fontSize: 12 }}>{ errorText }</DangerText>
            </FadeInOutView>
            <View style={{ width: SIDEBAR_WIDTH, height: INPUT_PANEL_HEIGHT, flexDirection: "column", justifyContent: "flex-start", alignItems: "center", padding: 10 }}>
                <FadeInOutView visible={!disableAction && recorded} style={{ alignItems: "center" }} >
                    <Subtitle style={{ color: "#E8E8E8", fontSize: 15, marginTop: 3, marginBottom: 1, fontWeight: "bold" }}>{ millisToMinutesAndSeconds(curDuration) }</Subtitle>
                    <RippleTouch borderless borderRadius={12} opacity={0.5} onPress={resetRecord} disabled={disableAction || !recorded} RGBcolor={"173,35,35"} >
                        <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
                            <Icon source={CANCEL_ICON} tint={"#EDEDED"} dimensions={18} />
                        </View>
                    </RippleTouch>
                </FadeInOutView>
                <View style={{ position: "absolute", bottom: 15 }} >
                    <Icon source={SEND_DISABLED_ICON} dimensions={30} />
                </View>
                <RippleTouch borderless opactiy={0.3} onPress={send} disabled={disableAction || !recorded}>
                    <FadeInOutView visible={!disableAction && recorded} style={{ position: "absolute", bottom: 15 }} >
                        <Icon source={!disableAction && recorded ? SEND_ICON: SEND_DISABLED_ICON} dimensions={30} />
                    </FadeInOutView>
                </RippleTouch>
            </View>
        </ContainerView>
    )
}, areEqual);

function areEqual(prevProps: any, nextProps: any) {
    return prevProps.loading == nextProps.loading;
}