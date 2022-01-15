import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Verification from './views/auth/Verification';
import { useSelector } from 'react-redux';
import { GlobalState } from './store/Store';

const Stack = createStackNavigator();

export default function Auth() {

    const verifying = useSelector(({ auth }: GlobalState) => auth.verifying);

    return (
        <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#FAFAFA" }}}>
            <Stack.Navigator initialRouteName={verifying ? "Verification" : "Login"} screenOptions={{ headerShown: false, gestureEnabled: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Verification" component={Verification} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}