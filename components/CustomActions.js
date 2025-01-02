import { TouchableOpacity, StyleSheet, View, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { image, setImage } from './Chat'


const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID, setImage,/* setSelectedLocation */}) => {
    const actionSheet = useActionSheet();
    const { showActionSheetWithOptions } = useActionSheet();
    // const [image, setImage] = useState(null);

    const uploadAndSendImage = async (imageUri) => {
        console.log(imageUri)
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Create a unique file name
            const uniqueFileName = `${uuidv4()}.jpg`;
            const storageRef = ref(storage, uniqueFileName);

            // Upload image to Firebase storage
            await uploadBytes(storageRef, blob);

            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            // Log and send message with image URL
            console.log("Image uploaded:", downloadUrl);
            onSend([
                {
                    _id: uuidv4(),
                    createdAt: new Date(),
                    text: "",
                    user: {
                        _id: userID,
                        name: "userName",
                    },
                    image: downloadUrl, // Assign the image URL
                },
            ]);
        } catch (error) {
            console.error("Image upload failed:", error);
        }
    };

    const handleAction = async (index) => {
        switch (index) {
            case 0: // Pick image from library
                const result = await ImagePicker.launchImageLibraryAsync(
                    // mediaTypes: ImagePicker.MediaType.Images,
                );
                console.log(result)
                if (!result.canceled) {
                    uploadAndSendImage(result.assets[0].uri);
                }
                break;

            // case 1: // Take photo
            //     console.log("dummy")
            //     const cameraResult =  await ImagePicker.launchCameraAsync([]
            //         //mediaTypes: ImagePicker.MediaType.Images,
            //     );
            //     console.log(cameraResult)
            //     if (!cameraResult.canceled) {
            //         uploadAndSendImage(cameraResult.assets[0].uri);
            //     }
            //     break;

            case 1: // take photo
                console.log("opening camera...");

                let { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus !== "granted") {
                    Alert.alert("camera permissions are required to take photos");
                    return;
                }
                try {
                    const cameraResult = await ImagePicker.launchCameraAsync({
                        
                    });

                    if(!cameraResult.canceled) {
                        uploadAndSendImage(cameraResult.assets[0].uri);
                    } else {
                        console.log("canceled by user")
                    }
                } catch (error) {
                    console.error("error accessing camera:", error);
                    Alert.alert("an error occurred while accessing the camera")
                }



            case 2: // Send location
                let { status:locationStatus } = await Location.requestForegroundPermissionsAsync();
                if (locationStatus === "granted") {
                    const location = await Location.getCurrentPositionAsync({});
                    console.log("Location:", location);

                    // onSend([
                    //     {
                    //         _id: uuidv4()
                    //     }
                    // ])

                     onSend([
                        {
                            _id: uuidv4(),
                            createdAt: new Date(),
                            text: "",
                            user: {
                                _id: userID,
                                name: "userName",
                            },
                            location: {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }, 
                        },
                    ]);
                }
                console.log("bye")
                break;

            default:
                console.log("3")
                break;
        }
    };

    const onActionsPress = () => {
        const options = ["Choose From Library", "Take Picture", "Send Location", "Cancel"];
        const cancelButtonIndex = 3;
        showActionSheetWithOptions({ options, cancelButtonIndex }, handleAction);
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onActionsPress}>
            <Text style={styles.text}>+</Text>
        </TouchableOpacity>
    );
}

    
    /*const getLocation = async () => {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if(location) {
                console.log('location:', location);
               /* setSelectedLocation({
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                }); */ 
                /*onSend({
                    _id: uuidv4(),
                    text: '',
                    createdAt: new Date(),
                    user: { _id: userID },
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    },
                });*//*
                onSend([
                    {
                        _id: `${userID}-${new Date().getTime()}`,
                        text: '', // No text since it's an image
                        createdAt: new Date(),
                        user: { _id: userID },
                        image: downloadURL, // Image from Firebase
                    },
                ]);
                
            } else Alert.alert('error occurred while fetching location');
        }else Alert.alert('permissions have not been granted');
    }

    const generateReference = (uri) => {
        const timeStamp = (new Date()).getTime();
        const imageName = uri.split("/")[uri.split("/").length - 1];
        return `${userID}-${timeStamp}-${imageName}`; 
    }*/

    /* old const uploadAndSendImage = async (imageURI) => {
        const uniqueRefString = generateReference(imageURI);
        const newUploadRef = ref(storage, uniqueRefString);
        const response = await fetch(imageURI);
        const blob = await response.blob();

        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const imageURL = await getDownloadURL(snapshot.ref)

            const messageId = uuidv4();

            onSend({ 
                _id: messageId,
                image: imageURL,
                createdAt: new Date(),
                text: '',
                user: { _id: userID },
                
             });
        });
    }; */

    /*const uploadAndSendImage = async (imageURI) => {
        if (!imageURI) {
            console.warn('No image to upload');
            return;
        }
    
        const uniqueName = `${userID}/${new Date().getTime()}.jpg`;
        const imageRef = ref(storage, uniqueName);
    
        try {
            const response = await fetch(imageURI);
            const blob = await response.blob();
            const snapshot = await uploadBytes(imageRef, blob);
    
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('Image uploaded:', downloadURL);
    
            // Send the image message via onSend
            onSend([
                {
                    _id: uniqueName,
                    text: '',
                    createdAt: new Date(),
                    user: { _id: userID },
                    image: downloadURL,
                },
            ]);
        } catch (error) {
            console.error('Error uploading and sending image:', error);
        }
    };
    

   

    const pickImage = async () => {
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(permissions?.granted){
            let result = await ImagePicker.launchImageLibraryAsync();
            if(!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert("permissions haven't been granted");
        }

    };

    const takePhoto = async () => {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();

        if(permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync();
            if(!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert("permissions haven't been granted");
        }

    };
    

    const onActionPress = () => {
        const options = ['choose from library', 'take picture', 'send location', 'cancel'];
        const cancelButtonIndex = options.length - 1;
        actionSheet.showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (buttonIndex) => {
                switch (buttonIndex) {
                  case 0:
                    pickImage();
                    return;
                  case 1: 
                    takePhoto();
                    return;
                  case 2: 
                    getLocation();
                  default:
                }
            },
        );
    };

    return (
        <TouchableOpacity style={styles.container} accessible={true} accessibilityLabel='more options' accessibilityRole='button' accessibilityHint='options for sending images or location' onPress={onActionPress}>
          <View style={[styles.wrapper, wrapperStyle]}>
             <Text style={[styles.iconText, iconTextStyle]}>+</Text>
          </View>
        </TouchableOpacity>
    );
}*/

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
    },
    wrapper: {
        borderRadius: 13,
        borderColor: '#b2b2b2',
        borderWidth: 2,
        flex: 1,
    },
    iconText: {
        color: '#b2b2b2',
        fontWeight: 'bold',
        fontSize: 10,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
})

export default CustomActions;