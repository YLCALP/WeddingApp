import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface EventTypeSelectionProps {
    value: 'wedding' | 'engagement';
    onChange: (type: 'wedding' | 'engagement') => void;
}

export function EventTypeSelection({ value, onChange }: EventTypeSelectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Etkinlik Türü</Text>
            <View style={styles.typeContainer}>
                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        value === 'wedding' && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange('wedding')}
                >
                    <Ionicons
                        name="heart"
                        size={32}
                        color={value === 'wedding' ? Colors.light.primary : Colors.light.textMuted}
                    />
                    <Text style={[
                        styles.typeText,
                        value === 'wedding' && styles.typeTextActive,
                    ]}>
                        Düğün
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.typeButton,
                        value === 'engagement' && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange('engagement')}
                >
                    <Ionicons
                        name="diamond"
                        size={32}
                        color={value === 'engagement' ? Colors.light.primary : Colors.light.textMuted}
                    />
                    <Text style={[
                        styles.typeText,
                        value === 'engagement' && styles.typeTextActive,
                    ]}>
                        Nişan
                    </Text>
                </TouchableOpacity>
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
    typeContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.light.border,
    },
    typeButtonActive: {
        borderColor: Colors.light.primary,
        backgroundColor: Colors.light.primary + '10',
    },
    typeText: {
        marginTop: 8,
        fontSize: 16,
        color: Colors.light.textMuted,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    typeTextActive: {
        color: Colors.light.primary,
        fontFamily: Typography.fontFamily.serif,
    },
});
