import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export function ProfileHeader() {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Profil</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
});
