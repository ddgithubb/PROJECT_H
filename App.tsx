import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus, PermissionsAndroid, Platform, StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Main from './src/Main';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, persistor, GlobalState, getState } from './src/store/Store'
import { PersistGate } from 'redux-persist/lib/integration/react';
import Auth from './src/Auth';
import SplashScreen from 'react-native-splash-screen'
import { fatalError } from './src/services/Errors.service';
import { reInitializeApp } from './src/services/Initialize.service';
import { appActions } from './src/store/slices/App.slice';
import { getWebsocketState } from './src/services/Websocket.service';
import { authActions } from './src/store/slices/Auth.slice';
import Orientation from 'react-native-orientation-locker';

function AppCondition() {
  const authenticated = useSelector(({ authenticated }: GlobalState) => authenticated.authenticated);
  const [ permitted, setPermitted ] = useState(true);

  useEffect(() => {
    if (!authenticated) return;
    async function runPermissions() {
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
  
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
          setPermitted(true);
        } else {
          console.log('All required permissions not granted');
          setPermitted(false);
          return;
        }
      }
    }
    runPermissions();
  }, [authenticated]);

  return (
    authenticated ? (
      permitted ? <Main /> : undefined //TODO: Eventually put the not permitted view here
    ) : (
      <Auth />
    )
  )
}

function AppGate() {
  const [ gateLifted, setGateLifted ] = useState(false);
  const err = useSelector(({ errors }: GlobalState) => errors.clientErr || errors.networkErr)
  const dispatch = useDispatch();

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (getState().app.state.match(/inactive|background/) && nextAppState === 'active') {
      let state = getWebsocketState()
      if (state == 2 || state == 3) reInitializeApp()
    }

    dispatch(appActions.setAppState(nextAppState))
    console.log('AppState', nextAppState);
  };

  const onBeforeLift = () => {
    async function loadDataAsync() {
      try {
        if (getState().auth.deviceToken == "") {
          // if (CHECK IF IS DEVICE) { BYPASS
              dispatch(authActions.setDeviceToken("TEST_DEVICE"))
          // } else {
          //     fatalError("not a device")
          // }
        }

        await reInitializeApp();

        setGateLifted(true);
        SplashScreen.hide();
      } catch (e) {
        fatalError(e);
      }
    }
    loadDataAsync();
  }

  return (
    <PersistGate persistor={persistor} onBeforeLift={onBeforeLift}>
      {
        gateLifted && !err ? (
          <AppCondition />
        ) : <></>
      }
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
    </PersistGate>
  )
}

export default function App() {
  
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppGate />
      </Provider>
    </SafeAreaProvider>
  );
}