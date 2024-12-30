// import the screens
import Start from './components/Start';
import Chat from './components/Chat';
//import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getAuth, signInAnonymously,initializeAuth, getReactNativePersistence } from 'firebase/auth';
//import storage & connectivity check
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { LogBox, Alert } from 'react-native';
import { getStorage } from "firebase/storage";

//create the navigator
const Stack = createNativeStackNavigator();

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCVXFAaFkGZLb8bG4t8VSNClQd2s9L-e9A",
    authDomain: "mobileapp-8f265.firebaseapp.com",
    projectId: "mobileapp-8f265",
    storageBucket: "mobileapp-8f265.appspot.com",
    messagingSenderId: "378096216136",
    appId: "1:378096216136:web:066c8fd27702425963507d"
  };

  //auth already initialized error fix attempt (didnt work alone, changed to getAuth)
  let app;  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app, { //initializeAuth changed to getAuth to resolve error
    persistence: getReactNativePersistence(AsyncStorage)
  });

  //check connection status
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if(connectionStatus.isConnected === false) {
      Alert.alert("connection lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
      <Stack.Screen
          name="Start"
        >
          {props => <Start auth={auth} {...props} />}
        </Stack.Screen>

        <Stack.Screen
          name="Chat"
        >
          {props => <Chat isConnected={connectionStatus.isConnected} db={db} storage={storage} {...props} />}
          </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;