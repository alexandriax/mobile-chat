import { useState } from 'react';
import { ImageBackground, StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import bkgImage from '../assets/bkgImage.png';
import txtboxIcon from '../assets/txtboxIcon.png';
import { getAuth, signInAnonymously,initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Start = ({ navigation, app, auth }) => {
 
    const [name, setName] = useState('');
    const [bkgColor, setBkgColor] = useState('')

    const signInUser = () => {
        signInAnonymously(auth)
          .then((result) => {
            navigation.navigate("Chat", {
                userID: result.user.uid,
                name: name,
                backgroundColor: bkgColor }); //passes chosen bk color
            Alert.alert("signed in successfully!");
          })
          .catch((error) => {
            Alert.alert("unable to sign in, try again");
          })
    }

    const handleColorChange = (color) => {
        setBkgColor(color);
    };

    return (
        <View style={styles.container}>
          {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
           ) : null}
          {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding" />
           ) : null}
        <ImageBackground source={bkgImage} resizeMode="cover" style={styles.image}>
            <Text style={styles.title}>Chat</Text>
          
            <View style={styles.inputContainer}>
              <View style={styles.textbox}>
                <Image
                  source={txtboxIcon}
                  style={styles.icon}
                />
                <TextInput
                   style={styles.textInput}
                   value={name}
                   onChangeText={setName}
                   placeholder='your name'
                />
               </View>

               <Text style={styles.bkgChoiceTxt}>choose background color:</Text>
               <View style={styles.bkgChoiceContainer}>
               
               <TouchableOpacity
                 style={[
                    styles.bkgChoiceOuter, 
                    bkgColor === '#090C08' && { borderColor: '#090C08'}, // border color matches bkg color
                    bkgColor === '#090C08' && styles.selectedOuter]} //highlight selected
                 onPress={() => handleColorChange('#090C08')} 
                >
                  <View
                      style={[styles.bkgChoiceInner, { backgroundColor: '#090C08'}, // black
                        bkgColor === '#090C08' && styles.selectedInner]}
                    > 
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                 style={[
                    styles.bkgChoiceOuter, 
                    bkgColor === '#474056' && { borderColor: '#474056'},
                    bkgColor === '#474056' && styles.selectedOuter]} //highlight selected
                 onPress={() => handleColorChange('#474056')} 
                >
                  <View
                      style={[styles.bkgChoiceInner, { backgroundColor: '#474056'}, // grey
                        bkgColor === '#474056' && styles.selectedInner]}
                    > 
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                 style={[
                    styles.bkgChoiceOuter, 
                    bkgColor === '#8A95A5' && { borderColor: '#8A95A5'},
                    bkgColor === '#8A95A5' && styles.selectedOuter]}  //highlight selected
                 onPress={() => handleColorChange('#8A95A5')} 
                >
                  <View
                      style={[styles.bkgChoiceInner, { backgroundColor: '#8A95A5'}, // blue
                        bkgColor === '#8A95A5' && styles.selectedInner]}
                    > 
                  </View>
                </TouchableOpacity>

               <TouchableOpacity
                 style={[
                    styles.bkgChoiceOuter, 
                    bkgColor === '#B9C6AE' && { borderColor: '#B9C6AE'},
                    bkgColor === '#B9C6AE' && styles.selectedOuter]}  //highlight selected
                 onPress={() => handleColorChange('#B9C6AE')} 
                >
                  <View
                      style={[styles.bkgChoiceInner, { backgroundColor: '#B9C6AE'}, // green
                        bkgColor === '#B9C6AE' && styles.selectedInner]}
                    > 
                  </View>
                </TouchableOpacity>
               </View>
               <TouchableOpacity
                 style={styles.chatBtn}
                 onPress={signInUser} // user sign in when button is pressed
                >
                <Text style={styles.btnText}>start chatting</Text>
                </TouchableOpacity>
               <TouchableOpacity/>
            </View> 
        </ImageBackground>   
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer:{
       width: "88%",
       height: "44%",
       backgroundColor: '#FFFFFF',
       padding: 20,
       justifyContent: 'center',
       alignItems: 'center',
       marginBottom: 20, 
    },
    textbox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        width: "88%",
        padding: 10,
        marginTop: 15,
        marginBottom: 40,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#757083',
        opacity: 0.5,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    title: {
        fontSize: 45,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 150,
    },
    bkgChoiceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '75%',
        marginTop: 10,
    },
    bkgChoice: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 20,
    }, 
    bkgChoiceOuter: {
        width: 50,
        height: 50,
        borderRadius: 25, //'100%'
        marginBottom: 20,
    },
    selectedOuter: {
        borderWidth: 2,
        padding: 2,
    },
    bkgChoiceInner: {
        width: 50,
        height: 50,
        borderRadius: 25, //'100%'
    },
    selectedInner: {
        width: 42,
        height: 42,
    },
    bkgChoiceTxt: {
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        marginBottom: 20,
    },
    chatBtn: {
        width: '88%',
        height: 40,
        backgroundColor: '#757083',
        padding: 5,
        alignItems: 'center',
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 5
    },
});

export default Start;