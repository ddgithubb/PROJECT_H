import React, { useState, useEffect } from 'react';
import { AppState, AppStateStatus, StatusBar } from 'react-native';
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

function AppCondition() {
  const authenticated = useSelector(({ authenticated }: GlobalState) => authenticated.authenticated);

  return (
    authenticated ? (
      <Main />
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
      } catch (e) {
        fatalError(e);
      } finally {
        setGateLifted(true);
        SplashScreen.hide();
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
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppGate />
      </Provider>
    </SafeAreaProvider>
  );
}