import { useState, useEffect } from 'react';
import { Bubble, GiftedChat, Time, InputToolbar } from 'react-native-gifted-chat';
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { getStorage } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';

const Chat = ({ route, navigation, db, isConnected, storage }) => {
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


    /*const onSend =  async (newMessages) => {
        
        if(isConnected) {
            if(newMessages.length > 0) {
                const message = newMessages[0];
                 if (image) {
                    console.log('attaching image', image);
                    message.image = image;
                }
                if (selectedLocation) {
                    console.log('attaching location', selectedLocation);
                    message.location = selectedLocation;
                } 
                await  addDoc(collection(db, 'messages'), message);
                setImage(null);
                setSelectedLocation(null); 
            }
        } else {
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages)); 
        }
        }; 

        useEffect(() => {
        navigation.setOptions({ title: name });
    }, []); */

    /*working const onSend = (newMessages) => {
        if (newMessages && Array.isArray(newMessages)) {
            newMessages.forEach((message) => {
                const formattedMessage = {
                    ...message,
                    createdAt: Timestamp.now(), // Ensure Timestamp is set
                };
    
                addDoc(collection(db, 'messages'), formattedMessage)
                    .then(() => console.log('Message sent:', formattedMessage))
                    .catch((error) => console.error('Error sending message:', error));
            });
    
            // Reset image and location
            setImage(null);
            setSelectedLocation(null);
        } else {
            console.error('newMessages is undefined or not an array', newMessages);
        }
    }; */

    const onSend = async (newMessages = []) => {
      if (isConnected) {
          for (const newMessage of newMessages) {
              // Attach image and location
              const messageToSend = {
                  ...newMessage,
                  createdAt: Timestamp.now(), // Use Firestore Timestamp
                  image: newMessage.image ? newMessage.image : null,     // Attach image if present
                  location: newMessage.location ? newMessage.location : null // Attach location if present
              };
  
              try {
                  // Send the message to Firebase
                  await addDoc(collection(db, 'messages'), messageToSend);
                  console.log('Message sent:', messageToSend);
              } catch (error) {
                  console.error('Error sending message:', error);
              }
              console.log(location)
          }
  
          // Reset image and location
          setImage(null);
          setSelectedLocation(null);
      } else {
          console.warn('You are offline. Saving message locally.');
          setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
      }
  };
  
    
  

   /* old on send
   const onSend = (newMessages) => {
      if(newMessages) {
        /* chatgpt suggestion 
        newMessages.forEach((message) => {
          addDoc(collection(db, 'messages'), {
            ...message,
            createdAt: Timestamp.now(),
          })
          .then(() => console.log('message added:', message))
          .catch((error) => console.error('error adding messages:', error));

          if (image) {
            message.image = image;
          }
          if (selectedLocation) {
            message.location = selectedLocation;
          }
        }) 
        addDoc(collection(db,'messages'), newMessages)
          .then(() => {
            setImage(null);  // Clear the image after sending
            setSelectedLocation(null);  // Clear the location after sending
          })
          console.log(doc)
          .catch((error) => {
            console.error("failed to send message:", error);
          });

      } else {
        console.error("newMessages is undefined", newMessages);
      }
    };  */

/* text fix but location & images break
const onSend = (newMessages) => {
    if (newMessages && Array.isArray(newMessages)) {
      newMessages.forEach((message) => {
        // Ensure the message has the correct structure
        const formattedMessage = {
          ...message,
          createdAt: message.createdAt.toDate
            ? message.createdAt
            : new Date(message.createdAt).toISOString(), // Handle createdAt properly
          user: message.user || { _id: 'default_id', name: 'Anonymous' }, // Ensure user exists
        };
  
        // Add the message to Firestore
        addDoc(collection(db, 'messages'), formattedMessage)
          .then(() => {
            console.log('Message sent successfully:', formattedMessage);
          })
          .catch((error) => {
            console.error('Failed to send message:', error);
          });
      });
    } else {
      console.error('newMessages is not an array or is undefined:', newMessages);
    }
  }; */
  useEffect(() => {
    let unsubscribe;

    if (isConnected) {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;

        const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(messagesQuery, (docs) => {
          let newMessages = [];
          docs.forEach((doc) => {
              const data = doc.data();
              let createdAt;
      
              // Safely handle `createdAt`
              if (data.createdAt && data.createdAt.toMillis) {
                  createdAt = new Date(data.createdAt.toMillis());
              } else {
                  console.warn(`Missing or invalid createdAt for message ${doc.id}:`, data);
                  createdAt = new Date(); // Fallback to current time
              }
      
              newMessages.push({
                  id: doc.id,
                  ...data,
                  createdAt,
              });
          });
      
          cacheMessages(newMessages);
          setMessages(newMessages);
      });
      
    } else {
        loadCachedMessages();
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };
}, [isConnected]);

const fixMessages = async () => {
  try {
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      const updates = messagesSnapshot.docs.map(async (messageDoc) => {
          const data = messageDoc.data();

          // Check if createdAt is a string and fix it
          if (typeof data.createdAt === 'string') {
              console.warn(`Fixing createdAt for message ${messageDoc.id}:`, data);
              await updateDoc(doc(db, 'messages', messageDoc.id), {
                  createdAt: Timestamp.fromDate(new Date(data.createdAt)),
              });
          }
      });

      await Promise.all(updates);
      console.log('Fix completed for all messages!');
  } catch (error) {
      console.error('Error fixing messages:', error);
  }
};

fixMessages();


  /*
    useEffect(() => {
        let unsubscribe;

        if(isConnected){
            if(unsubscribe)unsubscribe();
            unsubscribe = null;

            const messagesQuery = query(collection(db, "messages"), 
             orderBy('createdAt', 'desc')
            );
            console.log(new Date(doc.data().createdAt.toMillis()));

           unsubscribe = onSnapshot(messagesQuery, (docs) => {
                let newMessages = [];
                docs.forEach((doc) => {
                  console.log('document data', doc.data());
                    newMessages.push({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: new Date(doc.data().createdAt.toMillis())
                    })
                });
                
                cacheMessages(newMessages);
                setMessages(newMessages);
            }); */
            /* text fix 
            unsubscribe = onSnapshot(messagesQuery, (docs) => {
                let newMessages = [];
                docs.forEach(doc => {
                  const data = doc.data();
                  // Check if createdAt exists and is a Timestamp
                  let createdAt;
                  if (data.createdAt && data.createdAt.toMillis) {
                    createdAt = new Date(data.createdAt.toMillis());
                  } else {
                    console.warn('Missing or invalid createdAt field:', data);
                    createdAt = new Date(); // Fallback to current date/time
                  }
              
                  newMessages.push({
                    id: doc.id,
                    ...data,
                    createdAt, // Use the resolved createdAt value
                  });
                });
              
                cacheMessages(newMessages);
                setMessages(newMessages);
              }); 
        } else loadCachedMessages();

        return() => {
            if(unsubscribe)unsubscribe();
        };
    }, [isConnected]);*/

    const renderInputToolbar = (props) => {
        if(isConnected) {
            return (
              <InputToolbar {...props} />   
            );

        }
       return null;
    };

    /*const renderCustomActions = (props) => {
        return <CustomActions storage={storage} userID={userID} onSend={onSend} setImage={setImage}  setSelectedLocation={setSelectedLocation}  {...props} />;
    }*/

    const renderCustomActions = (props) => {
        return <CustomActions userID={userID} storage={storage} onSend={onSend} setSelectedLocation={setSelectedLocation}  {...props}  />;
    }

    const renderCustomView = (props) => {
        const { currentMessage } = props;
        if (currentMessage.location && currentMessage.location.latitude && currentMessage.location.longitude) {
            return (
                <MapView
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    style={{ width: 150, height: 100 }}
                />
            );
        }
        return null;
    } 

   /* const renderBubble = (props) => {
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
        }*/
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
                },}}
                textStyle={{ // sets txt color in bubble
                right: { 
                    color: '#000000',
                },
                left: {
                    color: '#000000',
                }
                }}
            >  
                  
                      {/* Render images */}
                      {currentMessage.image && (
                          <View style={{ padding: 10 }}>
                              <Image
                                  source={{ uri: currentMessage.image }}
                                  style={[styles.image]}
                              />
                          </View>
                      )}
          
                      {/* Render location map */}
                      {currentMessage.location && currentMessage.location.latitude && (
                          <MapView
                              region={{
                                  latitude: currentMessage.location.latitude,
                                  longitude: currentMessage.location.longitude,
                                  latitudeDelta: 0.0922,
                                  longitudeDelta: 0.0421,
                              }}
                              style={{ width: 150, height: 100 }}
                          />
                      )}
                  </Bubble>
              );
          };
          

        /*return (
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
                ) : (
                    <Text>no image available</Text>
                )}
            </Bubble>
        );
    };*/

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
              onSend={(messages) => onSend(messages)}
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