import { useState, useEffect } from 'react';
import { Bubble, GiftedChat, Time } from 'react-native-gifted-chat';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';

const Chat = ({ route, navigation }) => {
    const [messages, setMessages] = useState([]);
    const { name, backgroundColor } = route.params;
    const onSend = (newMessages) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages))
    }

    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);

    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'hello developer',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: "React Native",
                    avatar: "https://placeimg.com/140/140/any",
                },
            },
            {
                _id: 2,
                text: 'you have entered the chat', // system message 
                createdAt: new Date(),
                system: true,
            },
        ]);
    }, []);

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
        }else if (backgroundColor === '##B9C6AE') { // purple-grey bkg
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
                _id: 1
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
    }
});

export default Chat;