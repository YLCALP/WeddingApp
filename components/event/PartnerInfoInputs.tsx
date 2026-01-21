import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface PartnerInfoInputsProps {
    control: Control<any>;
    errors: FieldErrors<any>;
}

export function PartnerInfoInputs({ control, errors }: PartnerInfoInputsProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Çift Bilgileri</Text>

            <View style={styles.partnersRow}>
                <View style={styles.partnerInput}>
                    <Controller
                        control={control}
                        name="partner1Name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.partner1Name && styles.inputError]}
                                placeholder="1. Kişi Adı"
                                placeholderTextColor={Colors.light.textMuted}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.partner1Name && (
                        <Text style={styles.errorText}>{errors.partner1Name.message as string}</Text>
                    )}
                </View>

                <View style={styles.heartIcon}>
                    <Ionicons name="heart" size={24} color={Colors.light.primary} />
                </View>

                <View style={styles.partnerInput}>
                    <Controller
                        control={control}
                        name="partner2Name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.partner2Name && styles.inputError]}
                                placeholder="2. Kişi Adı"
                                placeholderTextColor={Colors.light.textMuted}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.partner2Name && (
                        <Text style={styles.errorText}>{errors.partner2Name.message as string}</Text>
                    )}
                </View>
            </View>
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
    partnersRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    partnerInput: {
        flex: 1,
    },
    heartIcon: {
        paddingTop: 14,
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
    inputError: {
        borderColor: Colors.light.error,
    },
    errorText: {
        color: Colors.light.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontFamily: Typography.fontFamily.serifRegular,
    },
});
