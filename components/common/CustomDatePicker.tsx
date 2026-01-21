import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface CustomDatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minimumDate?: Date;
    placeholder?: string;
}

export function CustomDatePicker({
    value,
    onChange,
    minimumDate,
    placeholder = 'Tarih Seçin',
}: CustomDatePickerProps) {
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(value || new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
            if (selectedDate) {
                onChange(selectedDate);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleDone = () => {
        onChange(tempDate);
        setShow(false);
    };

    return (
        <>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                    setTempDate(value || new Date());
                    setShow(true);
                }}
            >
                <Ionicons name="calendar-outline" size={20} color={Colors.light.textMuted} />
                <Text style={[styles.dateText, value && styles.dateTextSelected]}>
                    {value
                        ? value.toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })
                        : placeholder}
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
                <Modal
                    visible={show}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShow(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShow(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <TouchableOpacity
                                            onPress={() => setShow(false)}
                                            style={styles.modalButton}
                                        >
                                            <Text style={styles.cancelText}>İptal</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDone}
                                            style={styles.modalButton}
                                        >
                                            <Text style={styles.doneText}>Tamam</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="date"
                                        display="spinner"
                                        minimumDate={minimumDate}
                                        onChange={handleDateChange}
                                        textColor={Colors.light.text}
                                        locale="tr-TR"
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            ) : (
                show && (
                    <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display="default"
                        minimumDate={minimumDate}
                        onChange={handleDateChange}
                    />
                )
            )}
        </>
    );
}

const styles = StyleSheet.create({
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    dateText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textMuted,
    },
    dateTextSelected: {
        color: Colors.light.text,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: Colors.light.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    modalButton: {
        padding: 8,
    },
    cancelText: {
        fontSize: 17,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textMuted,
    },
    doneText: {
        fontSize: 17,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.primary,
    },
});
