import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Chat from './views/main/Chat';
import RequestComponent from './views/main/Requests';

const Stack = createStackNavigator();

export default function Main() {

    return (
        <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#FAFAFA" }}}>
            <Stack.Navigator initialRouteName={"Chat"} screenOptions={{ headerShown: false, gestureEnabled: true }}>
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="Requests" component={RequestComponent} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}