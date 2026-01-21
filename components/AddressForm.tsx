import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface AddressData {
    recipient_name: string;
    recipient_phone: string;
    shipping_address: string;
    city: string;
    district: string;
}

interface AddressFormProps {
    initialData?: Partial<AddressData>;
    onDataChange: (data: AddressData) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ initialData, onDataChange }) => {
    const [data, setData] = useState<AddressData>({
        recipient_name: initialData?.recipient_name || '',
        recipient_phone: initialData?.recipient_phone || '',
        shipping_address: initialData?.shipping_address || '',
        city: initialData?.city || '',
        district: initialData?.district || '',
    });

    const handleChange = (key: keyof AddressData, value: string) => {
        const newData = { ...data, [key]: value };
        setData(newData);
        onDataChange(newData);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="location-outline" size={20} color={Colors.light.text} />
                <Text style={styles.title}>Teslimat Bilgileri</Text>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad Soyad</Text>
                <TextInput
                    style={styles.input}
                    value={data.recipient_name}
                    onChangeText={(val) => handleChange('recipient_name', val)}
                    placeholder="Alıcı Adı Soyadı"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefon Numarası</Text>
                <TextInput
                    style={styles.input}
                    value={data.recipient_phone}
                    onChangeText={(val) => handleChange('recipient_phone', val)}
                    placeholder="05XX XXX XX XX"
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>İl</Text>
                    <TextInput
                        style={styles.input}
                        value={data.city}
                        onChangeText={(val) => handleChange('city', val)}
                        placeholder="İl"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>İlçe</Text>
                    <TextInput
                        style={styles.input}
                        value={data.district}
                        onChangeText={(val) => handleChange('district', val)}
                        placeholder="İlçe"
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Adres</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={data.shipping_address}
                    onChangeText={(val) => handleChange('shipping_address', val)}
                    placeholder="Mahalle, Sokak, Kapı No, vb."
                    multiline
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        padding: 16,
        paddingTop: 0,
        marginBottom: 16,
        // We do typically already wrap the modal content, so this container style is internal block style
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.light.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: Colors.light.text,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    }
});
