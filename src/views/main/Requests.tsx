import React, { memo, useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClickView } from "../../components/Animation.components";
import { ContainerView, EmptyComponent, Header, HeaderViews, Icon, RippleTouch, SearchBar, SubHeading, Subtitle } from "../../components/Generic.component";
import { BACK_ICON, CANCEL_ICON } from "../../services/Resource.service";
import { REQUEST_ROW_AMOUNT } from '../../services/Chat.service';
import { PhotoView } from "../../components/Chat.components";
import { ActivityIndicator, Keyboard, View } from "react-native";
import { BlankButton, DangerButton, InfoButton, SuccessButton } from "../../components/Form.components";
import { accept, getUserByUsername, request, unfriend, unrequest } from "../../services/Social.service";
import { Friend, Requests, User } from "../../models/User.model";
import { getState, GlobalState } from "../../store/Store";
import { useSelector } from "react-redux";

const RequestItem = memo(({ item, setSearchText }: any) => {
    return (
        <>
        {
            item.Username == "SECTION" ? (
                <Subtitle style={{ textAlign: "left", fontWeight: "bold", fontSize: 14, marginTop: 15, marginBottom: 10, marginLeft: 25 }}>{ item.RelationID }</Subtitle>
            ) : (
                <RippleTouch>
                    <ContainerView style={{ flexDirection: "row", paddingVertical: 10, paddingHorizontal: 20, alignItems: "center" }}>
                        <PhotoView style={{ marginRight: 15 }} dimensions={70}/>
                        <Subtitle style={{ textAlign: "left", paddingRight: 10, flex: 1 }} numberOfLines={1}>{ item.Username }</Subtitle>
                        {
                            item.Requested ? (
                                <View style={{ width: 100 }}>
                                    <BlankButton title="Unrequest" onPress={() => { setSearchText(""), unrequest(item.RelationID) }} />
                                </View>
                            ) : (
                                <View style={{ width: 90 }}>
                                    <InfoButton title="Accept" onPress={() => { setSearchText(""), accept(item.RelationID, item.ChainID) }} />
                                </View>
                            )
                        }
                    </ContainerView>
                </RippleTouch>
            )
        }
        </>
    )
});

var timeout: any;

function SearchedPerson({ searchText, setSearchText, reqItems }: any) {

    const [ searching, setSearching ] = useState(true);
    const [ nomatch, setNomatch ] = useState(true);
    const [ user, setUser ] = useState<User>();
    const [ selectedRequest, setSelectedRequest ] = useState<Requests | undefined>(undefined);
    const [ selectedFriend, setSelectedFriend ] = useState<Friend | undefined>(undefined);
    const [ isMe, setIsMe ] = useState(false);
    const [ requesting, setRequesting ] = useState(false);

    useEffect(() => {
        const ac = new AbortController();
        clearTimeout(timeout)
        setNomatch(true);
        setSearching(true);
        setIsMe(false);
        setUser(undefined)
        setSelectedRequest(undefined);
        setSelectedFriend(undefined);
        timeout = setTimeout(() => {
            if (getState().user.username == searchText) {
                let state = getState().user
                setIsMe(true)
                setNomatch(false);
                setUser({
                    Username: state.username,
                    UserID: state.userID,
                    Statement: state.statement,
                })
                setSearching(false);
            } else {
                if (searchText != "") {
                    let found = false;
                    for (const req of reqItems) {
                        if (req.Username == searchText) {
                            setSelectedRequest(req);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        for (const friend of getState().user.relations.Friends) {
                            if (friend.Username == searchText) {
                                setSelectedFriend(friend);
                                found = true;
                                break;
                            }
                        }
                    }
                    getUserByUsername(searchText).then((res) => {
                        if (res.Error) {
                            setNomatch(true)
                        } else {
                            setNomatch(false);
                            setUser(res as User)
                        }
                        setSearching(false);
                    })
                    return () => ac.abort();
                }
            }
        }, 400)
    }, [searchText]);

    const requestFriend = () => {
        setRequesting(true);
        request(user!.UserID, user!.Username).then((res) => {
            if (!res.Error) {
                console.log(res);
                setSearchText("");
            }
            setRequesting(false);
        })
    }

    const pressUnrequest = () => {
        setRequesting(true);
        unrequest(selectedRequest!.RelationID).then((res) => {
            if (!res.Error) {
                console.log(res);
                setSearchText("");
            }
            setRequesting(false);
        })
    }

    const pressAccept = () => {
        setRequesting(true);
        accept(selectedRequest!.RelationID, selectedRequest!.ChainID).then((res) => {
            if (!res.Error) {
                console.log(res);
                setSearchText("");
            }
            setRequesting(false);
        })
    }

    const pressUnfriend = () => {
        setRequesting(true);
        unfriend(selectedFriend!.RelationID).then((res) => {
            if (!res.Error) {
                console.log(res);
                setSearchText("");
            }
            setRequesting(false);
        })
    }

    return (
        <RippleTouch>
            <ContainerView style={{ paddingHorizontal: 20, paddingVertical: 10, borderBottomColor: "#D0D0D0", borderBottomWidth: 1 }}>
                <Subtitle style={{ textAlign: "left", fontWeight: "bold", marginTop: 10, marginBottom: 7 }}>SEARCHED</Subtitle>
                <ContainerView style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center", justifyContent: "center", minHeight: 70}}>
                    {
                        searching && searchText != "" ? (
                            <ActivityIndicator style={{ alignSelf: "center" }} size="large" color="#2D2C3E" />
                        ) : (
                            nomatch ? (
                                <Subtitle style={{ textAlign: "center", fontSize: 14, marginBottom: 10, marginTop: 5, color: "#A0A0A0" }} numberOfLines={1}>No users found</Subtitle>
                            ) : (
                                <>
                                <PhotoView style={{ marginRight: 15 }} dimensions={70}/>
                                <Subtitle style={{ textAlign: "left", paddingRight: 10, flex: 1 }} numberOfLines={1}>{ user?.Username }</Subtitle>
                                {
                                    !isMe ? (
                                        selectedRequest == undefined ? (
                                            selectedFriend == undefined ? (
                                                <View style={{ width: 95 }}>
                                                    <SuccessButton title="Request" disabled={requesting} onPress={requestFriend} />
                                                </View>
                                            ) : (
                                                <View style={{ width: 95 }}>
                                                    <DangerButton title="Unfriend" disabled={requesting} onPress={pressUnfriend} />
                                                </View>
                                            )
                                        ) : (
                                            selectedRequest.Requested ? (
                                                <View style={{ width: 100 }}>
                                                    <BlankButton title="Unrequest" disabled={requesting} onPress={pressUnrequest} />
                                                </View>
                                            ) : (
                                                <View style={{ width: 90 }}>
                                                    <InfoButton title="Accept" disabled={requesting} onPress={pressAccept} />
                                                </View>
                                            )
                                        )
                                    ) : <Subtitle style={{ fontWeight: "bold", marginRight: 5 }}>You</Subtitle>
                                }
                                </>
                            )
                        )
                    }
                </ContainerView>
            </ContainerView>
        </RippleTouch>
    )
}

export default function RequestComponent({ navigation }: any) {

    const [ searchText, setSearchText ] = useState("");
    const requests = useSelector(({ user }: GlobalState) => user.relations.Requests);

    const renderItem = ({ item }: any) => {
        return ( <RequestItem item={item} setSearchText={setSearchText}/> )
    }

    return (
        <SafeAreaView style={{ width: "100%", flex: 1 }}>
            <Header>
                <HeaderViews style={{ alignItems: "flex-start" }}><ClickView action={() => navigation.goBack()}><Icon source={ BACK_ICON } dimensions={30}/></ClickView></HeaderViews>
                <HeaderViews style={{ alignItems: "center", flexBasis: 110 }}><SubHeading>Requests</SubHeading></HeaderViews>
                <HeaderViews style={{ alignItems: "flex-end" }}></HeaderViews>
            </Header>
            <ContainerView style={{ paddingHorizontal: 15 }}>
                <SearchBar placeholder="Search person" value={searchText} onChangeText={(text: string) => setSearchText(text)} style={{ borderRadius: 5 }} height={45}/>
                {
                    searchText != "" ? (
                        <ClickView style={{ position: "absolute", right: 21, top: 5, padding: 5 }} action={() => { setSearchText(""), Keyboard.dismiss() }}>
                            <Icon source={ CANCEL_ICON } dimensions={25}></Icon>
                        </ClickView>
                    ) : <></>
                }
            </ContainerView>
            <SearchedPerson searchText={searchText} setSearchText={setSearchText} reqItems={requests}/>
            <FlatList
                data={requests} 
                extraData={requests} 
                renderItem={renderItem} 
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }} 
                style={{ paddingTop: 10 }} 
                horizontal={false} 
                numColumns={1} 
                initialNumToRender={REQUEST_ROW_AMOUNT} 
                maxToRenderPerBatch={10} 
                windowSize={5} 
                removeClippedSubviews={true} 
                ListEmptyComponent={EmptyComponent} 
                keyExtractor={(item) => item.RelationID} 
            />
        </SafeAreaView>
    );
}