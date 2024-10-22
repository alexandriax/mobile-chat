import { useState, useEffect } from 'react';
import { Bubble, GiftedChat, Time, InputToolbar } from 'react-native-gifted-chat';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { getStorage } from 'firebase/storage';

const Chat = ({ route, navigation, db, isConnected, }) => {
    const [messages, setMessages] = useState([]);
    const { name, userID, backgroundColor } = route.params ? route.params : { name: 'User', userID: '', backgroundColor: '#FFFFFF' };
    const [image, setImage] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);

    //load messages when offline
    const loadCachedMessages = async () => {
        try {
        const cachedMessages = await AsyncStorage.getItem("chat_messages") 
        if(cachedMessages !== null) {
        setMessages(JSON.parse(cachedMessages));
        }
    }catch (error) {
        console.error('error loading messages', error);
    }
    };

    const cacheMessages = async (messagesToCache) => {
        try {
            await AsyncStorage.setItem("chat_messages", JSON.stringify(messagesToCache));
        } catch (error) {
            console.error('failed:', error);
        }
    };


    const onSend = async (newMessages) => {
        
        if(isConnected) {
            if(newMessages.length > 0) {
                const message = newMessages[0];
                if (image) {
                    message.image = image;
                }
                if (selectedLocation) {
                    message.location = selectedLocation;
                }
                await addDoc(collection(db, 'messages'), message);
                setImage(null);
                setSelectedLocation(null);
            }
        } else {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages)); 
        }
        };
        

        useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);


    useEffect(() => {
        let unsubscribe;

        if (isConnected) {
            //unregister current onSnapshot listener to avoid registering multiple listeners when useEffect is executed
            if (unsubscribe) unsubscribe();
            unsubscribe = null;
            
        
        const messagesQuery = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc')
        );


        unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesList = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    user: data.user,
                };

            });
            cacheMessages(messagesList);
            setMessages(messagesList);
        });
      } else {
        loadCachedMessages();
      }

    

        return () => {
            if (unsubscribe) unsubscribe();
        };

    }, [isConnected, db]);

    const renderInputToolbar = (props) => {
        if(isConnected) {
            return (
              <InputToolbar {...props} />   
            );

        }
       return null;
    };

    const storage = getStorage();

    const renderCustomActions = (props) => {
        return <CustomActions storage={storage} userID={userID} onSend={onSend} setImage={setImage} setSelectedLocation={setSelectedLocation} {...props} />;
    }

    const renderCustomView = (props) => {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <MapView
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    }

    const renderBubble = (props) => {
        const { currentMessage } = props;

        let rightBubbleColor = '#EAEAEA'; // user default
        let leftBubbleColor = '#D0E6EB'; // other default

        if (backgroundColor === '#090C08') { //black bkg
            rightBubbleColor = '#D4EAE2';
            leftBubbleColor = '#FFFFFF';
        } else if (backgroundColor === '#474056') { // purple-grey bkg
            rightBubbleColor = '#F0F0F7';
            leftBubbleColor = '#F8E8D9';
        }else if (backgroundColor === '#8A95A5') { // purple-grey bkg
            rightBubbleColor = '#FDF6E3';
            leftBubbleColor = '#D0E6EB';
        }else if (backgroundColor === '#B9C6AE') { // purple-grey bkg
            rightBubbleColor = '#5A5A5A';
            leftBubbleColor = '#EFEFEF';
        }

        return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                    backgroundColor: rightBubbleColor, //sending 
                },
                left: {
                    backgroundColor: leftBubbleColor, //other persons msg
                }
              }}
              textStyle={{ // sets txt color in bubble
                right: { 
                    color: '#000000',
                },
                left: {
                    color: '#000000',
                }
              }}
            >  
            <View style={[ styles.container ]}>
                    {image && (
                        <Image
                            source={{ uri: image }}
                            style={[styles.image]}
                        />
                    )}
                    {selectedLocation && (
                        <MapView
                            region={{latitude: selectedLocation.latitude,
                              longitude: selectedLocation.longitude,
                              latitudeDelta: 0.0922,
                              longitudeDelta: 0.0421,
                            }}
                        />
                    )}
                </View>
                {currentMessage.image ? ( // add image to bubble
                    <View style={{ padding: 10 }}>
                        <Image
                            source={{ uri: currentMessage.image }}
                            style={[styles.image]} 
                        />
                    </View>
                ) : null}
            </Bubble>
        );
    };

    const renderTime = (props) => {
        return (
            <Time
              {...props}
              timeTextStyle={{
                right: {
                    color: '#808080', // color for time sent
                },
                left: {
                    color: '#808080',
                },
              }}
            />
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: backgroundColor}]}>

          {!isConnected && (
            <Text style={styles.connectionLost}>connection lost!</Text>
          )}
         
            <GiftedChat
              messages={messages}
              renderBubble={renderBubble}
              renderTime={renderTime}
              onSend={messages => onSend(messages)}
              renderInputToolbar={renderInputToolbar}
              renderActions={renderCustomActions}
              renderCustomView={renderCustomView} //map view
              user={{
                _id: userID, // pass userid
                name: name, //pass user name
              }}
            />

            { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
            { Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="padding" />: null }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 10
    },
    noMessagesText: {
        fontSize: 16,
        color: '#808080',
        textAlign: 'center',
        marginTop: 20,
    },
    connectionLost: {
        fontSize: 16,
        color: '#802d38',
        textAlign: 'center',
        marginVertical: 10,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10
    }
});

export default Chat;