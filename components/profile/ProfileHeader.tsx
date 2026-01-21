import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

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
        fontWeight: '700',
        color: Colors.light.text,
    },
});
