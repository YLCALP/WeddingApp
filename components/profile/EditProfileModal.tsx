import { Ionicons } from '@expo/vector-icons';
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface ToastState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    opacity: Animated.Value;
}

interface EditProfileModalProps {
    visible: boolean;
    name: string;
    email: string;
    isSaving: boolean;
    onNameChange: (name: string) => void;
    onSave: () => void;
    onClose: () => void;
    toast?: ToastState;
}

const toastColors = {
    success: Colors.light.primary,
    error: '#ff4444',
    info: '#4A90D9',
    warning: Colors.light.warning,
};

export function EditProfileModal({
    visible,
    name,
    email,
    isSaving,
    onNameChange,
    onSave,
    onClose,
    toast,
}: EditProfileModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                {/* Toast inside modal */}
                {toast?.visible && (
                    <Animated.View style={[styles.modalToast, { opacity: toast.opacity, backgroundColor: toastColors[toast.type] }]}>
                        <Ionicons
                            name={toast.type === 'warning' ? 'warning' : toast.type === 'error' ? 'close-circle' : 'checkmark-circle'}
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.modalToastText}>{toast.message}</Text>
                    </Animated.View>
                )}

                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Profili Düzenle</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ad Soyad</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={onNameChange}
                            placeholder="Ad Soyad"
                            placeholderTextColor={Colors.light.textMuted}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-posta</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>E-posta adresi değiştirilemez</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={onSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serif,
        fontWeight: '500', // keeping for weight if font supports it or fallback
        color: Colors.light.textSecondary,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.text,
        backgroundColor: Colors.light.surface,
    },
    inputDisabled: {
        backgroundColor: Colors.light.background,
        color: Colors.light.textMuted,
    },
    helperText: {
        fontSize: 12,
        color: Colors.light.textMuted,
        fontFamily: Typography.fontFamily.serifRegular,
        marginTop: 6,
    },
    saveButton: {
        height: 56,
        backgroundColor: Colors.light.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 17,
        fontFamily: Typography.fontFamily.serif,
        color: '#fff',
    },
    modalToast: {
        position: 'absolute',
        top: 50,
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
        elevation: 10,
        zIndex: 10,
    },
    modalToastText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: Typography.fontFamily.serif,
    },
});
