import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = 'Tamam',
    cancelText = 'İptal',
    confirmStyle = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={confirmStyle === 'destructive' ? 'warning' : 'help-circle'}
                            size={48}
                            color={confirmStyle === 'destructive' ? Colors.light.error : Colors.light.primary}
                        />
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                confirmStyle === 'destructive' ? styles.destructiveButton : styles.confirmButton
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Custom hook for managing confirm modal state
export function useConfirmModal() {
    const [visible, setVisible] = React.useState(false);
    const [config, setConfig] = React.useState<{
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmStyle?: 'default' | 'destructive';
        onConfirm: () => void;
    }>({
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const show = (options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmStyle?: 'default' | 'destructive';
        onConfirm: () => void;
    }) => {
        setConfig(options);
        setVisible(true);
    };

    const hide = () => {
        setVisible(false);
    };

    const handleConfirm = () => {
        config.onConfirm();
        hide();
    };

    return {
        visible,
        title: config.title,
        message: config.message,
        confirmText: config.confirmText,
        cancelText: config.cancelText,
        confirmStyle: config.confirmStyle,
        show,
        hide,
        onConfirm: handleConfirm,
        onCancel: hide,
    };
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: Colors.light.background,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    confirmButton: {
        backgroundColor: Colors.light.primary,
    },
    destructiveButton: {
        backgroundColor: Colors.light.error,
    },
    cancelButtonText: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textSecondary,
    },
    confirmButtonText: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.serif,
        color: '#fff',
    },
});
