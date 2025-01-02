import { TouchableOpacity, StyleSheet, View, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { image, setImage } from './Chat'


const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID, name, setImage}) => {
    const actionSheet = useActionSheet();
    const { showActionSheetWithOptions } = useActionSheet();


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
                        name: name,
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
                    
                );
                console.log(result)
                if (!result.canceled) {
                    uploadAndSendImage(result.assets[0].uri);
                }
                break;



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
                break;



            case 2: // Send location
                let { status:locationStatus } = await Location.requestForegroundPermissionsAsync();
                if (locationStatus === "granted") {
                    const location = await Location.getCurrentPositionAsync({});
                    console.log("Location:", location);

                  
                     onSend([
                        {
                            _id: uuidv4(),
                            createdAt: new Date(),
                            text: "",
                            user: {
                                _id: userID,
                                name: name,
                            },
                            location: {
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }, 
                        },
                    ]);
                }
                break;

            default:
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