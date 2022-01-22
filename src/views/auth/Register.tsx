import React from 'react';
import { ActivityIndicator, View } from "react-native";
import { InfoButton, Input } from '../../components/Form.components';
import { Heading, Icon, ContainerView, DangerText } from '../../components/Generic.component';
import MainStyles from '../../Main.css';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { EmailValidator } from '../../services/Validator.service';
import { useState } from 'react';
import { useEffect } from 'react';
import { FadeInView } from '../../components/Animation.components';
import { register } from '../../services/Auth.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { store } from '../../store/Store';
import { authActions } from '../../store/slices/Auth.slice';
import { REJECT_RESOURCE, CHECK_RESOURCE } from '../../services/Resource.service';

export default function Register({ navigation }: any) {

    const [ email, setEmail ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ emailErr, setEmailErr ] = useState(undefined as boolean | undefined);
    const [ usernameErr, setUsernameErr ] = useState(undefined as boolean | undefined);
    const [ passwordErr, setPasswordErr ] = useState(undefined as boolean | undefined);
    const [ error, setError ] = useState(true);
    const [ registering, setRegistering ] = useState(false)
    const [ errorText, setErrorText ] = useState("");

    const usernameValidator = new RegExp('^[a-zA-Z0-9_]+$');

    const validate = () => {
        if (email != "") EmailValidator(email) ? setEmailErr(false) : setEmailErr(true);
        if (username != "") usernameValidator.test(username) ? setUsernameErr(false) : setUsernameErr(true);
        if (password != "") password != "" && password.length >= 8 ? setPasswordErr(false) : setPasswordErr(true);
    }

    const validator = () => {
        password == "" || emailErr || emailErr == undefined || usernameErr || usernameErr == undefined || passwordErr || passwordErr == undefined ? setError(true) : setError(false);
    }

    const registerClick = () => {
        setRegistering(true);
        setErrorText("");
        register(username, email, password).then((res) => {
            if (res.Error) {
                setRegistering(false);
                if (res.Problem == "Email") {
                    setEmailErr(true);
                } else if (res.Problem == "Username") {
                    setUsernameErr(true);
                }
                setErrorText(res.Problem + " already exists!");
            } else {
                store.dispatch(authActions.setVerifying(true))
                navigation.reset({index: 0, routes: [{ name: 'Verification' }]});
            }
        })
    }

    useEffect(validator);

    return (
        <KeyboardAwareScrollView contentContainerStyle={[MainStyles.center, { width: "100%", height: "100%" }]}>
            <SafeAreaView style={[MainStyles.center, { width: 300 }]}>
                <Heading style={{ fontSize: 50, marginBottom: 20 }}>PROJECT <Heading style={{ fontSize: 50, marginBottom: 20, fontWeight: "bold" }}>H</Heading></Heading>
                <ContainerView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Input placeholder="Email" onChangeText={(text) => setEmail(text)} onBlur={validate} maxLength={1000}/>
                    {
                        emailErr != undefined ? (
                            <FadeInView style={{ position: "absolute", right: 10 }} >
                                <Icon source={emailErr ? REJECT_RESOURCE: CHECK_RESOURCE}/>
                            </FadeInView>
                        ) : undefined
                    }
                    
                </ContainerView>
                <ContainerView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Input placeholder="Username" onChangeText={(text) => setUsername(text)} onBlur={validate} maxLength={30}/>
                    {
                        usernameErr != undefined ? (
                            <FadeInView style={{ position: "absolute", right: 10 }} >
                                <Icon source={usernameErr ? REJECT_RESOURCE: CHECK_RESOURCE}/>
                            </FadeInView>
                        ) : undefined
                    }
                </ContainerView>
                <ContainerView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Input secureTextEntry={true} placeholder="Password [min 8 length]" onChangeText={(text) => setPassword(text)} onBlur={validate} maxLength={1000}/>
                    {
                        passwordErr != undefined ? (
                            <FadeInView style={{ position: "absolute", right: 10 }} >
                                <Icon source={passwordErr ? REJECT_RESOURCE: CHECK_RESOURCE}/>
                            </FadeInView>
                        ) : undefined
                    }
                </ContainerView>
                <ContainerView style={{ marginBottom: 15, marginTop: 30 }}>
                    <InfoButton onPress={registerClick} disabled={error || registering} title="Register" />
                </ContainerView>
                <ActivityIndicator style={{ marginBottom: -15, display: registering ? "flex" : "none" }} size="large" color="#2D2C3E" />
                <DangerText>{errorText}</DangerText>
                <ContainerView style={{ marginTop: 15, paddingTop: 30, borderTopWidth: 1, borderTopColor: "#D0D0D0"}}>
                    <InfoButton color="#2D2C3E" onPress={() => navigation.navigate("Login")} title="Already have an account?" />
                </ContainerView>
            </SafeAreaView>
        </KeyboardAwareScrollView>
    )
}