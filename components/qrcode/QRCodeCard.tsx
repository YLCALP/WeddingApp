import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { width } = Dimensions.get('window');
const QR_SIZE = width - 160;

interface QRCodeCardProps {
    qrUrl: string;
    qrCode: string;
    eventType: 'wedding' | 'engagement';
    partner1Name: string;
    partner2Name: string;
    qrRef?: React.RefObject<any>;
}

export function QRCodeCard({
    qrUrl,
    qrCode,
    eventType,
    partner1Name,
    partner2Name,
    qrRef,
}: QRCodeCardProps) {
    return (
        <View style={styles.qrCard}>
            <View style={styles.eventInfo}>
                <Ionicons
                    name={eventType === 'wedding' ? 'heart' : 'diamond'}
                    size={20}
                    color={Colors.light.primary}
                />
                <Text style={styles.eventNames}>
                    {partner1Name} & {partner2Name}
                </Text>
            </View>

            <View style={styles.qrContainer}>
                <QRCode
                    value={qrUrl}
                    size={QR_SIZE}
                    color={Colors.light.text}
                    backgroundColor="white"
                    logo={require('../../assets/images/icon.png')}
                    logoSize={40}
                    logoBackgroundColor="white"
                    logoMargin={4}
                    logoBorderRadius={8}
                    getRef={(ref) => qrRef && (qrRef.current = ref)}
                />
            </View>

            <Text style={styles.codeText}>{qrCode.toUpperCase()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    qrCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    eventInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    eventNames: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    qrContainer: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.light.primary + '30',
    },
    codeText: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: Typography.fontFamily.mono,
        color: Colors.light.textSecondary,
        letterSpacing: 3,
    },
});
