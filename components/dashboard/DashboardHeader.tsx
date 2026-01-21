import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface DashboardHeaderProps {
    userName: string;
    showNotification?: boolean;
    onNotificationPress?: () => void;
}

export function DashboardHeader({
    userName,
    showNotification = true,
    onNotificationPress,
}: DashboardHeaderProps) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Merhaba,</Text>
                <Text style={styles.userName}>{userName}</Text>
            </View>
            {showNotification && (
                <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
                    <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    userName: {
        fontSize: 24,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
        marginTop: 4,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
});
