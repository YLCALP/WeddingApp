import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { CustomDatePicker } from '../common/CustomDatePicker';

interface EventDetailsInputsProps {
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    eventDate?: Date;
}

export function EventDetailsInputs({ control, setValue, eventDate }: EventDetailsInputsProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Etkinlik Detayları</Text>

            {/* Date Picker */}
            <CustomDatePicker
                value={eventDate!}
                onChange={(date) => setValue('eventDate', date)}
                minimumDate={new Date()}
                placeholder="Tarih Seçin (Opsiyonel)"
            />

            {/* Venue */}
            <Controller
                control={control}
                name="venue"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="location-outline" size={20} color={Colors.light.textMuted} />
                        <TextInput
                            style={styles.inputIconText}
                            placeholder="Mekan (Opsiyonel)"
                            placeholderTextColor={Colors.light.textMuted}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    </View>
                )}
            />

            {/* City */}
            <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputWithIcon}>
                        <Ionicons name="business-outline" size={20} color={Colors.light.textMuted} />
                        <TextInput
                            style={styles.inputIconText}
                            placeholder="Şehir (Opsiyonel)"
                            placeholderTextColor={Colors.light.textMuted}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    </View>
                )}
            />

            {/* Description */}
            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Açıklama veya mesaj (Opsiyonel)"
                        placeholderTextColor={Colors.light.textMuted}
                        multiline
                        numberOfLines={3}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 16,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    input: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.light.text,
        borderWidth: 1,
        borderColor: Colors.light.border,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputWithIcon: {
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
    inputIconText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serifRegular,
    },
});
