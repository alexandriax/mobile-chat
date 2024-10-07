import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Chat = ({ route, navigation }) => {

    const { name, backgroundColor } = route.params;

    useEffect(() => {
        navigation.setOptions({ title: name });
    }, []);

    return (
        <View style={[styles.container, {backgroundColor: backgroundColor}]}>
            <Text>chat</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default Chat;