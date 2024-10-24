import { TouchableOpacity, StyleSheet, View, Text, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID, setImage, setSelectedLocation }) => {
    const actionSheet = useActionSheet();

    
    const getLocation = async () => {
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            const location = await Location.getCurrentPositionAsync({});
            if(location) {
                console.log('location:', location);
                setSelectedLocation({
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                });
                onSend({
                    location: {
                        longitude: location.coords.longitude,
                        latitude: location.coords.latitude,
                    },
                });
            } else Alert.alert('error occurred while fetching location');
        }else Alert.alert('permissions have not been granted');
    }

    const generateReference = (uri) => {
        const timeStamp = (new Date()).getTime();
        const imageName = uri.split("/")[uri.split("/").length - 1];
        return `${userID}-${timeStamp}-${imageName}`;
    }

    const uploadAndSendImage = async (imageURI) => {
        const uniqueRefString = generateReference(imageURI);
        const newUploadRef = ref(storage, uniqueRefString);
        const response = await fetch(imageURI);
        const blob = await response.blob();
        uploadBytes(newUploadRef, blob).then(async (snapshot) => {
            const imageURL = await getDownloadURL(snapshot.ref)
            console.log('image url', imageURL);
            onSend({ image: imageURL });
        });
    };

    const pickImage = async () => {
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissions?.granted) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
            });

            if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
            else Alert.alert('permission to access library denied')
        }
    };

    const takePhoto = async () => {
        let permissions = await ImagePicker.requestCameraPermissionsAsync();

        if (permissions?.granted) {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
            });

            if (!result.canceled) {
                let mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
                if (mediaLibraryPermissions?.granted) {
                    await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
                }
                await uploadAndSendImage(result.assets[0].uri);
            } 
        } else {
            Alert.alert('permission to access camera denied');
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
        <TouchableOpacity style={styles.container} accessible={true} accessibilityLabel='more options' accessibilityHint='options for sending images or location' onPress={onActionPress}>
          <View style={[styles.wrapper, wrapperStyle]}>
             <Text style={[styles.iconText, iconTextStyle]}>+</Text>
          </View>
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