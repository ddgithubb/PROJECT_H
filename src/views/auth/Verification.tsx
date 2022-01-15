import React, { useState, useEffect, useRef, Ref } from 'react';
import { ActivityIndicator, TextInput, View } from "react-native";
import MainStyles from '../../Main.css';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ContainerView, DangerText, Heading, Link, Subtitle } from '../../components/Generic.component';
import { InfoButton, DigitInput, SuccessButton } from '../../components/Form.components';
import { resendEmail, verifyEmail } from '../../services/Auth.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../../store/slices/Auth.slice';
import { GlobalState } from '../../store/Store';

export default function Verification({ navigation }: any) {
    
    //REFACTOR TO USE A STATE ARRAY
    const [ d1, setD1 ] = useState("");
    const [ d2, setD2 ] = useState("");
    const [ d3, setD3 ] = useState("");
    const [ d4, setD4 ] = useState("");
    const [ d5, setD5 ] = useState("");
    const [ d6, setD6 ] = useState("");
    const [ errorText, setErrorText ] = useState("");
    const [ verifying, setVerifying ] = useState(false);
    const [ verified, setVerified ] = useState(false);
    const [ filled, setFilled ] = useState(false);
    const [ resent, setResent ] = useState(false);
    const refD1 = useRef<TextInput>();
    const refD2 = useRef<TextInput>();
    const refD3 = useRef<TextInput>();
    const refD4 = useRef<TextInput>();
    const refD5 = useRef<TextInput>();
    const refD6 = useRef<TextInput>();
    const email = useSelector(({ auth }: GlobalState) => auth.email);
    const dispatch = useDispatch();

    const verifyClick = () => {
        setVerifying(true);
        const code = d1 + d2 + d3 + d4 + d5 + d6;
        verifyEmail(code).then((res) => {
            setVerifying(false);
            if (res.Error) {
                setD1("");
                setD2("");
                setD3("");
                setD4("");
                setD5("");
                setD6("");
                setErrorText("Incorrect code!");
            } else {
                setVerified(true);
                unsetVerifying();
            }
        })
    }

    const unsetVerifying = () => {
        dispatch(authActions.setVerifying(false));
    }

    useEffect(() => {
        setErrorText("");
        if (d1 != "" && d2 != "" && d3 != "" && d4 != "" && d5 != "" && d6 != "") {
            setFilled(true);
        } else {
            setFilled(false);
        }
    });

    return(
        <KeyboardAwareScrollView contentContainerStyle={[MainStyles.center, { width: "100%", height: "100%" }]}>
            <SafeAreaView style={[MainStyles.center, { width: 300 }]}>
                <Heading>Verify Email</Heading>
                <Subtitle style={{ color: "#404040" }}>Enter 6-digit code sent to:</Subtitle>
                <Subtitle style={{ fontWeight: "bold", marginVertical: 5 }}>{ email }</Subtitle>
                <ContainerView style={{ justifyContent: "space-between", flexDirection: "row", marginTop: 20 }}>
                    <DigitInput ref={refD1 as Ref<TextInput>} value={d1} onChangeText={(text) => {setD1(text.toUpperCase()), text != "" ? refD2.current!.focus() : undefined}}/>
                    <DigitInput ref={refD2 as Ref<TextInput>} value={d2} onChangeText={(text) => {setD2(text.toUpperCase()), text != "" ? refD3.current!.focus() : undefined}}/>
                    <DigitInput ref={refD3 as Ref<TextInput>} value={d3} onChangeText={(text) => {setD3(text.toUpperCase()), text != "" ? refD4.current!.focus() : undefined}}/>
                    <DigitInput ref={refD4 as Ref<TextInput>} value={d4} onChangeText={(text) => {setD4(text.toUpperCase()), text != "" ? refD5.current!.focus() : undefined}}/>
                    <DigitInput ref={refD5 as Ref<TextInput>} value={d5} onChangeText={(text) => {setD5(text.toUpperCase()), text != "" ? refD6.current!.focus() : undefined}}/>
                    <DigitInput ref={refD6 as Ref<TextInput>} value={d6} onChangeText={(text) => {setD6(text.toUpperCase()), text != "" ? refD6.current!.blur() : undefined}}/>
                </ContainerView>
                <ContainerView style={{ marginTop: 10, paddingTop: 20 }}>
                    {
                        filled && !verified ? (
                            <InfoButton disabled={verifying} onPress={verifyClick} title="Verify" />
                        ) : <></>
                    }
                    {
                        verified ? (
                            <SuccessButton onPress={() => navigation.reset({index: 0,routes: [{ name: 'Login' }]})} title="Success! Go Log in" />
                        ) : <></>
                    }
                </ContainerView>
                <ActivityIndicator style={{ marginTop: 15, marginBottom: -20, display: verifying ? "flex" : "none" }} size="large" color="#2D2C3E" />
                {
                    !resent && !verified && !verifying ? (
                        <Link onPress={() => { resendEmail(), setResent(true) }} style={{ marginTop: 20 }}>Resend Verification Email</Link>
                    ) : <></>
                }
                <DangerText style={{ marginTop: 10 }}>{errorText}</DangerText>
                <ContainerView style={{ marginTop: 20, paddingTop: 30, borderTopWidth: 1, borderTopColor: "#D0D0D0"}}>
                    <InfoButton color="#2D2C3E" onPress={() => { unsetVerifying(), navigation.reset({index: 0, routes: [{ name: 'Register' }]}) }} title="Register again" />
                </ContainerView>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    )
}