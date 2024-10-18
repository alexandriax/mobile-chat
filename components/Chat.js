import { useState, useEffect } from 'react';
import { Bubble, GiftedChat, Time } from 'react-native-gifted-chat';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

const Chat = ({ route, navigation, db }) => {
    const [messages, setMessages] = useState([]);
    const { name, userID, backgroundColor } = route.params ? route.params : { name: 'User', userID: '', backgroundColor: '#FFFFFF' };
    const onSend = async (newMessages) => {
        addDoc(collection(db, 'messages'), newMessages[0]);
    };
        

    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);

    useEffect(() => {
        const messagesQuery = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesList = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    user: data.user,
                };

            });
            setMessages(messagesList);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };

    }, [db]);

    const renderBubble = (props) => {

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
            />
        )
    }

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
         
            <GiftedChat
              messages={messages}
              renderBubble={renderBubble}
              renderTime={renderTime}
              onSend={messages => onSend(messages)}
              user={{
                _id: userID, // pass userid
                name: name, //pass user name
              }}
            />
            
            { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
            { Platform.OS === 'ios' ? <KeyboardAvoidingView behavior="padding" />: null }
        </View>
    );
}

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
});

export default Chat;