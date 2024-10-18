// import the screens
import Start from './components/Start';
import Chat from './components/Chat';
//import react Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { getAuth, signInAnonymously,initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

//create the navigator
const Stack = createNativeStackNavigator();

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCVXFAaFkGZLb8bG4t8VSNClQd2s9L-e9A",
    authDomain: "mobileapp-8f265.firebaseapp.com",
    projectId: "mobileapp-8f265",
    storageBucket: "mobileapp-8f265.appspot.com",
    messagingSenderId: "378096216136",
    appId: "1:378096216136:web:066c8fd27702425963507d"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

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
          {props => <Chat db={db} {...props} />}
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