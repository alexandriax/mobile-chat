import { useState } from 'react';
import { ImageBackground, StyleSheet, View, Text, Button, TextInput, TouchableOpacity } from 'react-native';
import bkgImage from '../assets/bkgImage.png';



const Start = ({ navigation }) => {
    const [name, setName] = useState('');
    const [bkgColor, setBkgColor] = useState('')

    const handleColorChange = (color) => {
        setBkgColor(color);
    };

    return (
        <View style={styles.container}>
        <ImageBackground source={bkgImage} resizeMode="cover" style={styles.image}>
            <Text style={styles.title}>Chat</Text>
          
            <View style={styles.inputContainer}>
              <TextInput
                 style={styles.textInput}
                 value={name}
                 onChangeText={setName}
                 placeholder='your name'
               />

               <Text style={styles.bkgChoiceTxt}>choose background color:</Text>
               <View style={styles.bkgChoiceContainer}>
               
               <TouchableOpacity
                 style={[styles.bkgChoice, { backgroundColor: '#090C08'}, // black
                   bkgColor === '#090C08' && styles.selected]} //highlight selected
                 onPress={() => handleColorChange('#090C08')}
                 
                />
               <TouchableOpacity 
                 style={[styles.bkgChoice, { backgroundColor: '#474056'}, // grey
                   bkgColor === '#474056' && styles.selected ]} //highlight selected
                 onPress={() => handleColorChange('#474056')}
                />
               <TouchableOpacity 
                 style={[styles.bkgChoice, { backgroundColor: '#8A95A5'}, // blue
                    bkgColor === '#8A95A5' && styles.selected]} //highlight selected
                 onPress={() => handleColorChange('#8A95A5')}
                />
               <TouchableOpacity 
                 style={[styles.bkgChoice, { backgroundColor: '#B9C6AE'}, // green
                    bkgColor === '#B9C6AE' && styles.selected]} //highlight selected
                 onPress={() => handleColorChange('#B9C6AE')}
                />
               </View>
               <TouchableOpacity
                 style={styles.chatBtn}
                 onPress={() => navigation.navigate('Chat', { name: name, backgroundColor: bkgColor })} // navigates to chat page
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
    textInput: {
        width: "88%",
        padding: 15,
        borderWidth: 1,
        marginTop: 15,
        marginBottom: 40,
        fontSize: 16,
        fontWeight: '600',
        color: '#757083',
        opacity: 0.5,

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
    selected: {
        borderWidth: 5,
        borderColor: '#FFFFFF',
        padding: 2,
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#757083',
        shadowRadius: 10,
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 0 },
    }
});

export default Start;