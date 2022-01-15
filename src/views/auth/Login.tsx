import React from 'react';
import { ActivityIndicator, View } from "react-native";
import { InfoButton, Input } from '../../components/Form.components';
import { ContainerView, DangerText, Heading, Icon, Link } from '../../components/Generic.component';
import MainStyles from '../../Main.css';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EmailValidator } from '../../services/Validator.service';
import { useState } from 'react';
import { useEffect } from 'react';
import { FadeInView } from '../../components/Animation.components';
import { login } from '../../services/Auth.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REJECT_RESOURCE, CHECK_RESOURCE } from '../../services/Resource.service';
import { initializeApp } from '../../services/Initialize.service';
import { useDispatch } from 'react-redux';
import { authActions } from '../../store/slices/Auth.slice';

export default function Login({ navigation }: any) {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState(true);
    const [ emailErr, setEmailErr ] = useState(undefined as boolean | undefined);
    const [ errorText, setErrorText ] = useState("");
    const [ logging, setLogging ] = useState(false);
    const dispatch = useDispatch()
    
    const validateEmail = () => {
        if (email != "") EmailValidator(email) ? setEmailErr(false) : setEmailErr(true);
    } 

    const validator = () => {
        password == "" || emailErr || emailErr == undefined ? setError(true) : setError(false);
    }

    const loginClick = () => {
        setLogging(true);
        setErrorText("");
        login(email, password).then((res) => {
            if (res.Error) {
                setLogging(false);
                if (res.Type == "Email") {
                    setEmailErr(true);
                    setErrorText("Email doesn't exist!");
                } else if (res.Type == "Password") {
                    setErrorText("Password is incorrect!");
                }
            } else {
                dispatch(authActions.setSession(res.SessionID))
                dispatch(authActions.setAuth(res.Tokens))
                initializeApp(res.Data);
            }
        })
    }

    useEffect(validator);

    return (
        <KeyboardAwareScrollView contentContainerStyle={[MainStyles.center, { width: "100%", height: "100%" }]}>
            <SafeAreaView style={[MainStyles.center, { width: 300 }]}>
                <Heading style={{ fontSize: 50, marginBottom: 20 }}>PROJECT <Heading style={{ fontSize: 50, marginBottom: 20, fontWeight: "bold" }}>H</Heading></Heading>
                <ContainerView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Input placeholder="Email" onChangeText={(text) => setEmail(text)} onBlur={validateEmail} maxLength={1000}/>
                    {
                        emailErr != undefined ? (
                            <FadeInView style={{ position: "absolute", right: 10 }} >
                                <Icon source={emailErr ? REJECT_RESOURCE : CHECK_RESOURCE}/>
                            </FadeInView>
                        ) : undefined
                    }
                </ContainerView>
                <ContainerView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Input style={{ paddingRight: 15 }} secureTextEntry={true} placeholder="Password" onChangeText={(text) => setPassword(text)} onBlur={validateEmail} maxLength={1000}/>
                </ContainerView>
                {/* <Link>Forgot Password?</Link> */}
                <ContainerView style={{ marginBottom: 15, marginTop: 25 }}>
                    <InfoButton onPress={loginClick} disabled={error || logging} title="Log In" />
                </ContainerView>
                <ActivityIndicator style={{ marginBottom: -15, display: logging ? "flex" : "none" }} size="large" color="#2D2C3E" />
                <DangerText>{errorText}</DangerText>
                <ContainerView style={{ marginTop: 15, paddingTop: 40, borderTopWidth: 1, borderTopColor: "#D0D0D0"}}>
                    <InfoButton color="#2D2C3E" onPress={() => navigation.navigate("Register")} title="Create account" />
                </ContainerView>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    )
}