import { Ionicons } from '@expo/vector-icons';
import {
    Animated,
    Keyboard,
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
import { Product } from './types';

interface ToastState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    opacity: Animated.Value;
}

interface CustomizationModalProps {
    visible: boolean;
    product: Product | null;
    customizationText: string;
    quantity: number;
    onTextChange: (text: string) => void;
    onQuantityChange: (delta: number) => void;
    onConfirm: () => void;
    onClose: () => void;
    toast?: ToastState;
}

const toastColors = {
    success: Colors.light.primary,
    error: '#ff4444',
    info: '#4A90D9',
    warning: Colors.light.warning,
};

export function CustomizationModal({
    visible,
    product,
    customizationText,
    quantity,
    onTextChange,
    onQuantityChange,
    onConfirm,
    onClose,
    toast,
}: CustomizationModalProps) {
    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.customModalOverlay}
                activeOpacity={1}
                onPress={() => Keyboard.dismiss()}
            >
                {/* Toast inside modal */}
                {toast?.visible && (
                    <Animated.View style={[styles.modalToast, { opacity: toast.opacity, backgroundColor: toastColors[toast.type] }]}>
                        <Ionicons
                            name={toast.type === 'warning' ? 'warning' : 'checkmark-circle'}
                            size={20}
                            color="#fff"
                        />
                        <Text style={styles.modalToastText}>{toast.message}</Text>
                    </Animated.View>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.customModalContent}>
                        <Text style={styles.customModalTitle}>Kişiselleştirme</Text>
                        <Text style={styles.customModalPrompt}>
                            {product.customization_prompt || 'Bu ürün için detay belirtiniz:'}
                        </Text>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.labelText}>
                                Adet (Min: {product.min_quantity || 1})
                            </Text>
                            <View style={styles.qtyContainer}>
                                <TouchableOpacity onPress={() => onQuantityChange(-1)} style={styles.qtyButton}>
                                    <Ionicons name="remove" size={20} />
                                </TouchableOpacity>
                                <Text style={styles.qtyText}>{quantity}</Text>
                                <TouchableOpacity onPress={() => onQuantityChange(1)} style={styles.qtyButton}>
                                    <Ionicons name="add" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.labelText}>Kişiselleştirme Notu</Text>
                        <TextInput
                            style={styles.customInput}
                            value={customizationText}
                            onChangeText={onTextChange}
                            placeholder="Buraya yazınız..."
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.customModalButtons}>
                            <TouchableOpacity style={[styles.customBtn, styles.cancelBtn]} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.customBtn, styles.confirmBtn]} onPress={onConfirm}>
                                <Text style={styles.confirmBtnText}>Ekle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    customModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 0,
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    customModalContent: {
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 24,
        width: '100%',
    },
    customModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: Colors.light.text,
    },
    customModalPrompt: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 16,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        marginBottom: 8,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
    },
    qtyButton: {
        padding: 8,
    },
    qtyText: {
        paddingHorizontal: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    customInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    customModalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    customBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelBtn: {
        backgroundColor: '#f0f0f0',
    },
    confirmBtn: {
        backgroundColor: Colors.light.primary,
    },
    cancelBtnText: {
        color: Colors.light.textSecondary,
        fontWeight: '600',
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '600',
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
        fontWeight: '600',
    },
});
