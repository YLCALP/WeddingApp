import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ProfileCardProps {
    name: string;
    email: string;
    onEditPress: () => void;
}

export function ProfileCard({ name, email, onEditPress }: ProfileCardProps) {
    return (
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={Colors.light.primary} />
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.name}>{name || 'Kullanıcı'}</Text>
                <Text style={styles.email}>{email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
                <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.light.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    email: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
