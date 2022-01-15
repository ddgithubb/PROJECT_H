import React, { memo, useMemo, useRef } from 'react';
import { PhotoView } from "../../components/Chat.components";
import { ContainerView, EmptyComponent, Header, HeaderViews, Heading, Icon, InfoDotIndicator, RippleTouch, SearchBar, Subtitle } from "../../components/Generic.component";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClickView, FadeInView } from '../../components/Animation.components';
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { COLUMN_AMOUNT, RENDER_AMOUNT, ITEM_DIMENSION } from '../../services/Chat.service';
import { CANCEL_RESOURCE, SEARCH_MORE_RESOURCE } from '../../services/Resource.service';
import { Animated, Easing, Keyboard, StyleSheet, View } from 'react-native';
import { GlobalState } from '../../store/Store';
import { InfoButton } from '../../components/Form.components';
import { MemoizedChatActivator } from './chat-activator/ChatActivator';
import { userActions } from '../../store/slices/User.slice';
import Fuse from 'fuse.js';
import { Friend } from '../../models/User.model';
import MainStyles, { DANGER_COLOR } from '../../Main.css';
import { MAX_SAVED_CHAIN_LENGTH, STATIC_ACTIVATOR_HEIGHT } from '../../config/constants';

const options = {
    findAllMatches: true,
    threshold: 0.6,
    keys: [
        "Username"
    ]
};

var curIndex = -1;

export default function Chat({ navigation }: any) {
    const selectedIndex = useSelector(({ user }: GlobalState) => user.selectedUserKey );
    const [ searchText, setSearchText ] = useState("");
    const flatlistRef = useRef<any>();
    const friends = useSelector(({ user }: GlobalState) => user.relations.Friends );
    const [ displayResult, setDisplayResult ] = useState<Friend[]>([]);
    const dispatch = useDispatch();

    const displayFriends = useMemo<Friend[]>(() => 
    {
        let res: Friend[] = displayFriends;
        if (!res) {
            if (friends) {
                res = friends.slice();
                res.sort((a, b) => b.LastRecv - a.LastRecv);
            }
        } else if (displayFriends.length != friends.length) {
            let diff = friends.length - displayFriends.length;
            if (diff > 0) {
                for (let i = displayFriends.length; i < friends.length; i++) {
                    res.unshift(friends[i]);
                }
            } else {
                //DELETION, not splice
            }
        } else if (friends.length > 1) {
            for (let i = 1; i < displayFriends.length; i++) {
                if (res[i].LastRecv != friends[res[i].Key].LastRecv) {
                    res.unshift(res.splice(i, 1)[0]);
                }
            }
        }
        return res;
    }, [friends]);

    // const changeDisplayFriends = 

    // useEffect(() => {
    //     if (prevDisplayLength != displayFriends.length) {
    //         const remainder = COLUMN_AMOUNT - (displayFriends.length % COLUMN_AMOUNT);
    //         if (remainder != COLUMN_AMOUNT) {
    //             var temp = [];
    //             for (let i = 0; i < remainder; i++) {
    //                 temp.push(
    //                     <FillerView key={i} />
    //                 )
    //             }
    //             setFillerComponent(temp);
    //         }
    //         prevDisplayLength = displayFriends.length;
    //     }
    // }, [displayFriends]);

    useEffect(() => {
        if (flatlistRef.current && selectedIndex != -1) {
            flatlistRef.current.scrollToOffset({ offset: ITEM_DIMENSION * Math.floor(curIndex / COLUMN_AMOUNT) });
        }
    }, [selectedIndex]);

    useEffect(() => { // doesn't useMemo because want immediate updates to searchText
        if (friends && friends.length != 0) {
            calculateDisplayFriendsResult();
        }
    }, [searchText]);

    const calculateDisplayFriendsResult = () => {
        const fuse = new Fuse(displayFriends, options);
        setDisplayResult(fuse.search(searchText).map(i => i.item));
    }

    const setSelectedFunction = (key: number, index: number) => {
        console.log(key, index)
        dispatch(userActions.setSelectedUserIndex(key));
        curIndex = index;
    };

    const renderItem = ({ item, index }: any) => {
        return (
            <SelectComponent item={item} index={index} isSelected={selectedIndex == item.Key} setSelectedFunction={setSelectedFunction} />
        )
    }

    return (
        <SafeAreaView style={{ width: "100%", flex: 1 }}>
            <Header>
                <HeaderViews style={{ alignItems: "flex-start" }}><Subtitle>|Profile|</Subtitle></HeaderViews>
                <HeaderViews style={{ alignItems: "center", flexBasis: 110 }}><Heading style={{ fontSize: 25, fontWeight:"bold" }}>PROJECT H</Heading></HeaderViews>
                <HeaderViews style={{ alignItems: "flex-end" }}><ClickView action={() => navigation.navigate("Requests")}><Icon source={ SEARCH_MORE_RESOURCE } dimensions={30}/></ClickView></HeaderViews>
            </Header>
            <ContainerView style={{ paddingHorizontal: 15 }}>
                <SearchBar placeholder="Find friend" value={searchText} onChangeText={(text: string) => setSearchText(text)}/>
                {
                    searchText != "" ? (
                        <ClickView style={{ position: "absolute", right: 20, top: 3, padding: 5 }} action={() => { setSearchText(""), Keyboard.dismiss() }}>
                            <Icon source={ CANCEL_RESOURCE } dimensions={20}></Icon>
                        </ClickView>
                    ) : <></>
                }
            </ContainerView>
            <FlatList 
                data={searchText == "" ? displayFriends : displayResult} 
                renderItem={renderItem} 
                extraData={selectedIndex} 
                ref={flatlistRef} 
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 15, paddingTop: 5 }} 
                style={{ paddingHorizontal: 10, paddingTop: 5, marginBottom: selectedIndex == -1 ? 0 : STATIC_ACTIVATOR_HEIGHT }} 
                horizontal={false} 
                numColumns={COLUMN_AMOUNT} 
                initialNumToRender={RENDER_AMOUNT} 
                maxToRenderPerBatch={RENDER_AMOUNT} 
                windowSize={2} 
                removeClippedSubviews={true} 
                ListEmptyComponent={ <EmptyComponent> { searchText == "" ? ( <InfoButton onPress={() => navigation.navigate("Requests")} title="Add friends"/>) : ( <Subtitle style={{ fontSize: 18, color: "#707070" }}>No result!</Subtitle> ) } </EmptyComponent> } 
                keyExtractor={(item) => item.Key} 
                getItemLayout={(data, index) => (
                    {length: ITEM_DIMENSION, offset: ITEM_DIMENSION * index, index}
                )} 
            />
            <MemoizedChatActivator />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    profileView: {
        flexGrow: 1,
        aspectRatio: 1,
        padding: 15,
        margin: 5,
        borderRadius: 6,
    },
});

function SelectView({ item, index, isSelected, setSelectedFunction }: any) {

    const pulseAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(
                pulseAnimation, 
                {
                    toValue: 1.3,
                    duration: 80,
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                pulseAnimation, 
                {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.sin)
                }
            )
        ]).start();
    }, [item.newMessages]);

    return (
      <RippleTouch>
        <FadeInView onTouchEndCapture={() => isSelected ? setSelectedFunction(-1, index) : setSelectedFunction(item.Key, index)} style={[MainStyles.center, styles.profileView, { maxWidth: ITEM_DIMENSION, maxHeight: ITEM_DIMENSION,  borderWidth: 2, borderColor: isSelected ? "#E5E5E5" : "#FAFAFA", backgroundColor: isSelected ? "#F5F5F5" : "#FAFAFA" }]}>
          {
            item.newMessages && item.newMessages > 0 ? (
              <Animated.View style={{ transform: [{ scale: pulseAnimation }], position: "absolute", top: 10, right: 10, height: 22, width: 22, backgroundColor: DANGER_COLOR, borderRadius: 50, alignItems: "center", justifyContent: "center" }}>
                  <Subtitle style={{ fontSize: 10, fontWeight: "bold", color: "#FAFAFA" }}>{ item.newMessages < MAX_SAVED_CHAIN_LENGTH ? item.newMessages : "49+" }</Subtitle>
              </Animated.View>
            ) : undefined
          }
          <PhotoView style={{ marginBottom: 15 }} /> 
          {/* borderColor: item.LastSeen < item.LastRecv ? "#606060" : "#D0D0D0"  */}
          <Subtitle style={{ textAlign: "center" }} numberOfLines={1}>{ item.Username }</Subtitle>
        </FadeInView>
      </RippleTouch>
    );
  }
  
  function areEqual(prevProps: any, nextProps: any) {
    return prevProps.isSelected == nextProps.isSelected && prevProps.newMessages == nextProps.newMessages;
  }
  
  export const SelectComponent = memo(SelectView, areEqual);