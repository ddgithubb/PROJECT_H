import React, { useState, useEffect, useRef } from 'react'
import { Animated, View } from 'react-native';
import { Icon, Subtitle } from '../../../../components/Generic.component';
import { PIXEL_WIDTH, HALF_PIXEL_WIDTH } from '../../../../config/dimensions';
import { Friend } from '../../../../models/User.model';
import { memo } from 'react';
import { getState, GlobalState } from '../../../../store/Store';
import { TouchableHighlight } from 'react-native-gesture-handler';
import ScrollView from '../../../../components/InfiniteHorizontalScrollView/ScrollView';
import { useDispatch, useSelector } from 'react-redux';
import { AudioResponse } from './AudioResponse';
import { GET_EXTRA_THRESHOLD, MESSAGE_SPACER, DEFAULT_LEFT_PLACEHOLDER_PADDING } from '../../../../config/constants';
import { getExtraChain } from '../../../../services/Chains.service';
import { EXTRA_CHAIN_LENGTH } from '../../../../config/constants';
import { PlaceholderGenerator } from './PlaceholderGenerator';
import { userActions } from '../../../../store/slices/User.slice';
import { MESSAGES_LOAD_LEFT, MESSAGES_LOAD_RIGHT, MESSAGES_TO_LOAD } from '../../../../services/Chat-activator.service';
import { BACK_RESOURCE } from '../../../../services/Resource.service';

var chainOffsets: (number | undefined)[] = []; 

var curFriend: Friend | undefined = undefined;
var initOffset: number;
var thresholdLeft: boolean;
var thresholdRight: boolean;
var curLength: number;
var curObject;
var tempOffset: number;
var tempIndex: number;
var scrolledToEnd: boolean;
var toNewest: boolean;
var leftPadding: number;

export const ChainDisplay = memo(() => {
    const currentIndex = useSelector(({ user }: GlobalState) => user.currentUserKey);
    const chain = useSelector(({ user }: GlobalState) => user.chains[currentIndex]);
    const audioState = useSelector(({ audio }: GlobalState) => audio);
    const chainRef = useRef<any>();
    const [ disabled, setDisabled ] = useState(false);
    const isNewestAnimation = useRef<Animated.Value>(new Animated.Value(70)).current;
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("TRIGGERED CURRENT INDEX");
        thresholdRight = false;
        thresholdLeft = false;
        curLength = -1;
        scrolledToEnd = false;
        toNewest = false;
        leftPadding = 0;
        initOffset = chainOffsets[currentIndex] || 0;
        curFriend = getState().user.relations.Friends[currentIndex];
    }, [currentIndex]);

    useEffect(() => {
        if (chain?.isNewest) scrolledToEnd = true;
        if (!chain) return;
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
        if (chain.isNewest) {
            chainRef.current.scrollToEnd({ animated: !toNewest });
            toNewest = false;
            return;
        }
        if (thresholdLeft || thresholdRight) {
            thresholdLeft = false;
            thresholdRight = false;
            setDisabled(false);
        }
    }

    const onScroll = ({ nativeEvent }: any) => {
        //console.log("velocity", nativeEvent.velocity.x, "offset", nativeEvent.contentOffset.x, "width", nativeEvent.contentSize.width );
        chainOffsets[currentIndex] = nativeEvent.contentOffset.x;
        if (!thresholdLeft && !thresholdRight && !toNewest) {
            curLength = getVirtualLength();
            curObject = getItemByVirtualIndex(chain.virtualIndex);
            leftPadding = !chain.virtualizedChain[0]?.first && !chain.newestChain[0].first ? DEFAULT_LEFT_PLACEHOLDER_PADDING : 0;
            tempOffset = curObject.offset + leftPadding;
            tempIndex = chain.virtualIndex;
            if (tempIndex > 0 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH < tempOffset) {
                do {
                    //console.log("desc calc new VI:", nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH, tempOffset);
                    tempIndex--;
                    tempOffset -= getItemByVirtualIndex(tempIndex).totalWidth;
                } while(tempIndex > 0 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH < tempOffset);
                //console.log("NEW VIRTUAL INDEX:", tempIndex);
                dispatch(userActions.setVirtualIndex({ index: currentIndex, virtualIndex: tempIndex }));
            } else if (tempIndex < curLength - 1 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH >= tempOffset + curObject.totalWidth) {
                do {
                    //console.log("asc calc new VI:", nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH, tempOffset);
                    tempOffset += getItemByVirtualIndex(tempIndex).totalWidth;
                    tempIndex++;
                } while (tempIndex < curLength - 1 && nativeEvent.contentOffset.x + HALF_PIXEL_WIDTH >= tempOffset + curObject.totalWidth);
                //console.log("NEW VIRTUAL INDEX:", tempIndex);
                dispatch(userActions.setVirtualIndex({ index: currentIndex, virtualIndex: tempIndex }));
            }
            if (nativeEvent.contentOffset.x == 0) { //nativeEvent.contentOffset.x <= GET_EXTRA_THRESHOLD + leftPadding
                getDescExtraChain();
            } else if (nativeEvent.contentOffset.x == nativeEvent.contentSize.width - PIXEL_WIDTH) { //nativeEvent.contentOffset.x >= nativeEvent.contentSize.width - GET_EXTRA_THRESHOLD - 2 * PIXEL_WIDTH
                getAscExtraChain();
            }
            if (!chain.isNewest && chain.spaceBetween == 0 && nativeEvent.contentOffset.x >= nativeEvent.contentSize.width - PIXEL_WIDTH) {
                console.log("isNewest");
                dispatch(userActions.setIsNewest({ index: currentIndex, isNewest: true }));
            } else if (chain.isNewest && nativeEvent.contentOffset.x < nativeEvent.contentSize.width - PIXEL_WIDTH) {
                console.log("isNotNewest");
                dispatch(userActions.setIsNewest({ index: currentIndex, isNewest: false }));
            }
        }
    };

    const getDescExtraChain = () => {
        if (!chain || chain.virtualizedChain[0]?.first || chain.newestChain[0].first) return;
        console.log("DESC EXTRA")
        thresholdLeft = true;
        setDisabled(true);
        getExtraChain(currentIndex, chain.virtualizedChain[0]?.Created || chain.newestChain[0].Created, false).then((res) => {
            if (!res.Error) {
                dispatch(userActions.addDescExtraChain({ index: currentIndex, chain: res }));
            }
        });
    }

    const getAscExtraChain = () => {
        if (!chain) return;
        if (chain.spaceBetween == 0) return;
        console.log("ASC EXTRA");
        thresholdRight = true;
        setDisabled(true);
        getExtraChain(currentIndex, chain.virtualizedChain[chain.virtualizedChain.length - 1].Created, true, chain.spaceBetween > EXTRA_CHAIN_LENGTH ? EXTRA_CHAIN_LENGTH : chain.spaceBetween).then((res) => {
            if (!res.Error) {
                dispatch(userActions.addAscExtraChain({ index: currentIndex, chain: res }));
            }
        });;
    };

    const leftVirtualPadding = () => {
        if (chain.virtualIndex - MESSAGES_LOAD_LEFT >= 0) {
            return getItemByVirtualIndex(chain.virtualIndex - MESSAGES_LOAD_LEFT).offset;
        }
        return 0;
    };

    const rightVirtualPadding = () => {
        curLength = getVirtualLength();
        if (chain.virtualIndex + MESSAGES_LOAD_RIGHT < curLength) {
            let item = getItemByVirtualIndex(curLength - 1);
            return item.offset + item.totalWidth - getItemByVirtualIndex(chain.virtualIndex + MESSAGES_LOAD_RIGHT).offset;
        }
        return 0;
    };
 
    const getItemByVirtualIndex = (vIndex: number) => {
        if (chain.spaceBetween == 0 && vIndex >= chain.virtualizedChain.length) {
            return chain.newestChain[vIndex - chain.virtualizedChain.length];
        }
        return chain.virtualizedChain[vIndex];
    }

    const getVirtualLength = () => {
        return chain.virtualizedChain.length + (chain.spaceBetween == 0 ? chain.newestChain.length : 0);
    }

    const goToNewest = () => {
        if (chain.virtualizedChain.length == 0) {
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
                        contentContainerStyle={{ paddingLeft: MESSAGE_SPACER, paddingRight: (chain.spaceBetween == 0 ? MESSAGE_SPACER : 0)}} 
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 2
                        }} 
                        style={{ overflow: "visible" }} 
                        horizontal={true} 
                        showsHorizontalScrollIndicator={false} 
                        removeClippedSubviews={true} 
                        onScroll={onScroll} 
                        scrollEnabled={!disabled} 
                        scrollEventThrottle={16} 
                        onContentSizeChange={updateScrollPosition} 
                        contentOffset={{ x: initOffset || chain.initOffset, y: 0 }}
                        key={currentIndex}
                    >
                        {
                            !chain.virtualizedChain[0]?.first && !chain.newestChain[0].first ? <PlaceholderGenerator width={DEFAULT_LEFT_PLACEHOLDER_PADDING + 50} leftPadding={-50} /> : undefined
                        }
                        <View style={{ width: leftVirtualPadding() }} />
                        {
                            chain.newestChain.length > 0 ? (
                                (chain.spaceBetween == 0 ? chain.virtualizedChain.concat(chain.newestChain) : chain.virtualizedChain).slice(Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT), Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT) + MESSAGES_TO_LOAD).map((item, index) => {  //.slice(Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT), Math.max(0, chain.virtualIndex - MESSAGES_LOAD_LEFT) + MESSAGES_TO_LOAD)
                                    return (
                                        <AudioResponse 
                                            item={item}
                                            key={item.key}
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
                            chain.spaceBetween != 0 ? <PlaceholderGenerator width={DEFAULT_LEFT_PLACEHOLDER_PADDING + 50} rightPadding={-50} /> : undefined
                        }
                    </ScrollView>
                    <Animated.View style={{ position: "absolute", right: 10, bottom: 13, transform: [{ translateX: isNewestAnimation }] }}>
                        <TouchableHighlight disabled={disabled} underlayColor={"#2A2A2A"} activeOpacity={0.5} onPress={goToNewest} style={{ borderRadius: 50, width: 40, height: 40, backgroundColor: "#2F2F2F", shadowColor: "#000", shadowOffset: { width: 0, height: 1,}, shadowOpacity: 0.3, shadowRadius: 2.5, elevation: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon source={BACK_RESOURCE} tint={"#FAFAFA"} style={{ transform: [{ rotateY: '180deg' }] }} />
                        </TouchableHighlight>
                    </Animated.View>
                    </>
                )
            }
        </>
    );
});