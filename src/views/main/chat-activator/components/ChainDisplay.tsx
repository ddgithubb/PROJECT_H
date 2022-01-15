import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react'
import { Animated, View } from 'react-native';
import { Icon, Subtitle } from '../../../../components/Generic.component';
import { PIXEL_WIDTH, HALF_PIXEL_WIDTH } from '../../../../config/dimensions';
import { Chain, Friend } from '../../../../models/User.model';
import { memo } from 'react';
import { getState, GlobalState } from '../../../../store/Store';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { AudioResponse } from './AudioResponse';
import { MESSAGE_MAX_WIDTH, GET_EXTRA_THRESHOLD, MESSAGE_HEIGHT, MESSAGE_SPACER, DEFAULT_LEFT_PLACEHOLDER_PADDING, NEGATIVE_TRESHOLD_LIMIT, INITIAL_LEFT_PADDING, STATIC_ACTIVATOR_HEIGHT } from '../../../../config/constants';
import { getExtraChain } from '../../../../services/Chains.service';
import { EXTRA_CHAIN_LENGTH, MAX_SAVED_CHAIN_LENGTH } from '../../../../config/constants';
import { somethingWrong } from '../../../../services/Errors.service';
import { PlaceholderGenerator } from './PlaceholderGenerator';
import { userActions, parseAscChain, parseDescChain } from '../../../../store/slices/User.slice';
import { MESSAGES_LOAD_LEFT, MESSAGES_LOAD_RIGHT, MESSAGES_TO_LOAD } from '../../../../services/Chat-activator.service';
import { BACK_RESOURCE } from '../../../../services/Resource.service';

var chainOffsets: (number | undefined)[] = []; 

var curFriend: Friend | undefined = undefined;
var thresholdLeft: boolean;
var thresholdRight: boolean;
var prevLeftPadding: number;
var curLength: number;
var initialized = true;
var leftRes: any = undefined;
var goToOffset: number | undefined = undefined;
var requireFullStop: boolean;
var loading: boolean;
var curObject;
var curOffset: number;
var tempIndex: number;
var scrolledToEnd: boolean;
var toNewest: boolean;

export const ChainDisplay = memo(() => {
    const currentIndex = useSelector(({ user }: GlobalState) => user.currentUserKey);
    const chain = useSelector(({ user }: GlobalState) => user.chains[currentIndex]);
    const audioState = useSelector(({ audio }: GlobalState) => audio);
    const [ disableScroll, setDisableScroll ] = useState(false);
    const chainRef = useRef<any>();
    const isNewestAnimation = useRef<Animated.Value>(new Animated.Value(70)).current;
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("TRIGGERED CURRENT INDEX");
        thresholdRight = false;
        thresholdLeft = false;
        prevLeftPadding = 0;
        curLength = -1;
        initialized = false;
        leftRes = undefined;
        goToOffset = undefined;
        requireFullStop = false;
        loading = false;
        scrolledToEnd = false;
        toNewest = false;
        curFriend = getState().user.relations.Friends[currentIndex];
    }, [currentIndex]);

    useEffect(() => {
        if (!chain) return;
        if (thresholdLeft && chain.leftPadding != prevLeftPadding && (!chain.attached || (chain.attached && leftRes && getVirtualLength() - curLength == leftRes.chain.length))) {
            if (requireFullStop && disableScroll) {
                goToOffset = (chain.virtualizedChain[leftRes.chain.length] || chain.newestChain[leftRes.chain.length]).offset + (chainOffsets[currentIndex]! - (prevLeftPadding));
            } else if (!requireFullStop) {
                thresholdLeft = false;
                if (disableScroll) setDisableScroll(false);
            }
            leftRes = undefined;
        }
        console.log("virtual index:", chain.virtualIndex, chain.leftPadding, prevLeftPadding)
        prevLeftPadding = chain.leftPadding;
        curLength = getVirtualLength();
    }, [chain]);

    useEffect(() => {
        if (disableScroll) {
            chainRef.current.scrollTo({ x: chainOffsets[currentIndex]!, y: 0, animated: true });
            console.log("DISABLE SCROLL HIT: ", disableScroll, requireFullStop);
            if (requireFullStop && leftRes) {
                prependChain();
            } else {
                loading = true;
            }
        } else {
            loading = false;
        }
    }, [disableScroll]);

    useEffect(() => {
        if (chain?.isNewest) scrolledToEnd = true;
        if (!chain || !initialized) return;
        if (!chain.isNewest) {
            Animated.spring(
                isNewestAnimation,
                {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 6
                }
            ).start();
        } else {
            Animated.timing(
                isNewestAnimation,
                {
                    toValue: 70,
                    duration: 150,
                    useNativeDriver: true,
                }
            ).start();
        }
    }, [chain?.isNewest]);

    const updateScrollPosition = () => { 
        console.log("updated", chain.isNewest);
        if (!initialized && chain.newestChain.length > 0) {
            initialized = true;
            console.log(chain.initOffset);
            if (!chainOffsets[currentIndex]) {
                chainRef.current.scrollTo({x: chain.initOffset, y: 0, animated: false});
            } else if (chainOffsets[currentIndex]) {
                chainRef.current.scrollTo({x: chainOffsets[currentIndex], y: 0, animated: false});
            }
            return;
        }
        if (chain.isNewest) {
            chainRef.current.scrollToEnd({ animated: !toNewest });
            toNewest = false;
            return;
        }
        if (thresholdLeft && goToOffset) {
            chainRef.current.scrollTo({x: goToOffset, y: 0, animated: false});
            thresholdLeft = false;
            goToOffset = undefined;
            console.log("UNLOADING!!!");
            setDisableScroll(false);
        } else if (thresholdRight) {
            thresholdRight = false;
        }
    }

    const onScroll = ({ nativeEvent }: any) => {
        //console.log("velocity", nativeEvent.velocity.x, "offset", nativeEvent.contentOffset.x, "width", nativeEvent.contentSize.width );
        chainOffsets[currentIndex] = nativeEvent.contentOffset.x;
        if (thresholdLeft && !disableScroll && (nativeEvent.contentOffset.x <= chain.leftPadding - NEGATIVE_TRESHOLD_LIMIT || nativeEvent.contentOffset.x == 0)) {
            console.log("Disabling scroll")
            setDisableScroll(true);
            return;
        }
        if (!disableScroll) {
            curObject = getItemByVirtualIndex(chain.virtualIndex);
            curOffset = curObject.offset;
            tempIndex = chain.virtualIndex;
            if (tempIndex > 0 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH < curOffset) {
                do {
                    //console.log("desc calc new VI:", nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH, curOffset);
                    tempIndex--;
                    curOffset -= getItemByVirtualIndex(tempIndex).totalWidth;
                } while(tempIndex > 0 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH < curOffset);
                //console.log("NEW VIRTUAL INDEX:", tempIndex);
                dispatch(userActions.setVirtualIndex({ index: currentIndex, virtualIndex: tempIndex }));
            } else if (tempIndex < curLength - 1 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH >= curOffset + curObject.totalWidth) {
                do {
                    //console.log("asc calc new VI:", nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH, curOffset);
                    curOffset += getItemByVirtualIndex(tempIndex).totalWidth;
                    tempIndex++;
                } while (tempIndex < curLength - 1 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH >= curOffset + curObject.totalWidth);
                //console.log("NEW VIRTUAL INDEX:", tempIndex);
                dispatch(userActions.setVirtualIndex({ index: currentIndex, virtualIndex: tempIndex }));
            }
        }
        if (!chain.newestChain[0].first && !thresholdLeft && !thresholdRight) {
            if (nativeEvent.contentOffset.x <= GET_EXTRA_THRESHOLD + chain.leftPadding) {
                getDescExtraChain();
            } else if (nativeEvent.contentOffset.x >= nativeEvent.contentSize.width - GET_EXTRA_THRESHOLD - 2 * PIXEL_WIDTH) { 
                getAscExtraChain();
            }
        }
        if (!chain.isNewest && chain.attached && nativeEvent.contentOffset.x >= nativeEvent.contentSize.width - PIXEL_WIDTH) {
            console.log("isNewest");
            dispatch(userActions.setIsNewest({ index: currentIndex, isNewest: true }));
        } else if (chain.isNewest && nativeEvent.contentOffset.x < nativeEvent.contentSize.width - PIXEL_WIDTH) {
            console.log("isNotNewest");
            dispatch(userActions.setIsNewest({ index: currentIndex, isNewest: false }));
        }
    };

    const getDescExtraChain = () => {
        if (!chain || chain.virtualizedChain[0]?.first || chain.newestChain[0].first) return;
        console.log("DESC EXTRA")
        thresholdLeft = true;
        getExtraChain(currentIndex, chain.virtualizedChain[0]?.Created || chain.newestChain[0].Created, false).then((res) => {
            if (!res.Error) {
                leftRes = parseDescChain(res, chain.virtualizedChain[0] || chain.newestChain[0]);
                requireFullStop = leftRes.chain.length < EXTRA_CHAIN_LENGTH || leftRes.totalWidth > chain.leftPadding - DEFAULT_LEFT_PLACEHOLDER_PADDING;
                console.log("GET EXTRA CHAIN HIT: ", disableScroll, requireFullStop)
                if (!requireFullStop || loading) prependChain();
            }
        });
    }

    const getAscExtraChain = () => {
        if (!chain) return;
        if (chain.attached) return; //Eventually check condition if it is really newest, if not completely get newChain
        console.log("ASC EXTRA")
        thresholdRight = true;
        getExtraChain(currentIndex, chain.virtualizedChain[chain.virtualizedChain.length - 1].Created, true, chain.spaceBetween > EXTRA_CHAIN_LENGTH ? EXTRA_CHAIN_LENGTH : chain.spaceBetween).then((res) => {
            if (!res.Error) {
                dispatch(userActions.addAscExtraChain({ index: currentIndex, chain: res, asc: true }));
            }
        });;
    };

    const prependChain = () => {
        console.log("Prepending...")
        if (requireFullStop) { //THE INCOMING WIDTH IS LESS THAN OR EQUAL TO leftPadding - DEFAULT_PADDING
            let prevOffset = chainOffsets[currentIndex]!;
            let tempInterval = setInterval(() => {
                if (prevOffset == chainOffsets[currentIndex]) {
                    dispatch(userActions.addDescExtraChain({ index: currentIndex, chain: leftRes.chain, totalWidth: leftRes.totalWidth, asc: false }));
                    clearInterval(tempInterval);
                } else {
                    prevOffset = chainOffsets[currentIndex]!;
                }
            }, 100);
        } else if (!requireFullStop) {
            dispatch(userActions.addDescExtraChain({ index: currentIndex, chain: leftRes.chain, totalWidth: leftRes.totalWidth, asc: false }));
        }
    }

    const leftVirtualPadding = () => {
        if (chain.virtualIndex - MESSAGES_LOAD_LEFT >= 0) {
            return getItemByVirtualIndex(chain.virtualIndex - MESSAGES_LOAD_LEFT).offset - chain.leftPadding;
        }
        return 0;
    };

    const rightVirtualPadding = () => {
        let length = getVirtualLength();
        if (chain.virtualIndex + MESSAGES_LOAD_RIGHT < length) {
            let item = getItemByVirtualIndex(length - 1);
            return item.offset + item.totalWidth - getItemByVirtualIndex(chain.virtualIndex + MESSAGES_LOAD_RIGHT).offset;
        }
        return 0;
    };
 
    const getItemByVirtualIndex = (vIndex: number) => {
        if (chain.attached && vIndex >= chain.virtualizedChain.length) {
            return chain.newestChain[vIndex - chain.virtualizedChain.length];
        }
        return chain.virtualizedChain[vIndex];
    }

    const getVirtualLength = () => {
        return chain.virtualizedChain.length + (chain.attached ? chain.newestChain.length : 0);
    }

    const goToNewest = () => {
        if (chain.attached) {
            chainRef.current.scrollToEnd({ animated: true });
        } else {
            toNewest = true;
            dispatch(userActions.goToNewest({ index: currentIndex }));
        }
    }

        // setInterval(() => {
        //     let chain = {
        //         MessageID: "abc" + i,
        //         UserID: "test",
        //         Created: 11,
        //         Duration: 11,
        //         Seen: false,
        //         Action: 0,
        //         Display: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        //     }
        //     dispatch(userActions.addMessage({ chain, index:0 }))
        //     i++;
        // }, 5000);

    return (
        <>
            {
                !chain ? (
                    <PlaceholderGenerator width={PIXEL_WIDTH} leftPadding={-(MESSAGE_SPACER * 2)} />
                ) : (
                    <>
                    <ScrollView
                        ref={chainRef} 
                        contentContainerStyle={{ paddingLeft: MESSAGE_SPACER, paddingRight: (chain.attached ? MESSAGE_SPACER : 0)}}
                        horizontal={true} 
                        showsHorizontalScrollIndicator={false} 
                        removeClippedSubviews={true} 
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        scrollEnabled={!disableScroll} 
                        onContentSizeChange={updateScrollPosition}
                    >
                        {
                            !chain.virtualizedChain[0]?.first && !chain.newestChain[0].first ? <PlaceholderGenerator width={DEFAULT_LEFT_PLACEHOLDER_PADDING} leftPadding={(chain.leftPadding - DEFAULT_LEFT_PLACEHOLDER_PADDING)} /> : undefined
                        }
                        <View style={{ width: leftVirtualPadding() }} />
                        {
                            chain.newestChain.length > 0 ? (
                                (chain.attached ? chain.virtualizedChain.concat(chain.newestChain) : chain.virtualizedChain).slice(Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT), Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT) + MESSAGES_TO_LOAD).map((item, index) => {  
                                    return (
                                        <AudioResponse 
                                            key={item.key} 
                                            item={item} 
                                            chainID={curFriend!.ChainID} 
                                            selected={item.MessageID == audioState.curPlayingMessageID} 
                                            isPlaying={item.MessageID == audioState.curPlayingMessageID ? audioState.isPlaying : false} 
                                            isLastItem={chain.newestChain[chain.newestChain.length - 1].MessageID == item.MessageID} 
                                            lastSeen={!scrolledToEnd && curFriend?.LastSeen == item.Created}
                                        />
                                    )
                                })
                            ) : ( <Subtitle style={{ color: "#808080", marginBottom: 10 }}>No messages</Subtitle> )
                        }
                        <View style={{ width: rightVirtualPadding() }} />
                        {
                            !chain.attached ? <PlaceholderGenerator width={PIXEL_WIDTH} rightPadding={-PIXEL_WIDTH / 3} /> : undefined
                        }
                    </ScrollView>
                    <Animated.View style={{ position: "absolute", right: 10, bottom: 13, transform: [{ translateX: isNewestAnimation }] }}>
                        <TouchableHighlight disabled={disableScroll} underlayColor={"#2A2A2A"} activeOpacity={0.5} onPress={goToNewest} style={{ borderRadius: 50, width: 40, height: 40, backgroundColor: "#2F2F2F", shadowColor: "#000", shadowOffset: { width: 0, height: 1,}, shadowOpacity: 0.3, shadowRadius: 2.5, elevation: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon source={BACK_RESOURCE} tint={"#FAFAFA"} style={{ transform: [{ rotateY: '180deg' }] }} />
                        </TouchableHighlight>
                    </Animated.View>
                    </>
                )
            }
        </>
    );
});