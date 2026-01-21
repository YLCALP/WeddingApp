import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    opacity: Animated.Value;
}

const toastConfig: Record<ToastType, { icon: string; color: string }> = {
    success: { icon: 'checkmark-circle', color: Colors.light.primary },
    error: { icon: 'close-circle', color: '#ff4444' },
    info: { icon: 'information-circle', color: '#4A90D9' },
    warning: { icon: 'warning', color: Colors.light.warning },
};

export function Toast({ visible, message, type = 'success', opacity }: ToastProps) {
    if (!visible) return null;

    const config = toastConfig[type];

    return (
        <Animated.View style={[styles.toast, { opacity, backgroundColor: config.color }]}>
            <Ionicons name={config.icon as any} size={20} color="#fff" />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

// Custom hook for toast management
export function useToast() {
    const [visible, setVisible] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [type, setType] = React.useState<ToastType>('success');
    const opacity = React.useRef(new Animated.Value(0)).current;

    const show = (msg: string, toastType: ToastType = 'success', duration: number = 1500) => {
        setMessage(msg);
        setType(toastType);
        setVisible(true);

        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setVisible(false));
    };

    return {
        visible,
        message,
        type,
        opacity,
        show,
    };
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 9999,
        zIndex: 9999,
    },
    toastText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: Typography.fontFamily.serif,
    },
});
