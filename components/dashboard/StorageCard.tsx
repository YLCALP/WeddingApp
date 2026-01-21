import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface StorageCardProps {
    usedBytes: number;
    limitBytes: number;
}

export function StorageCard({ usedBytes, limitBytes }: StorageCardProps) {
    const isUnlimited = limitBytes === -1;
    const safeUsedBytes = usedBytes || 0;
    const safeLimitBytes = limitBytes || 1; // Prevent division by zero

    const formatBytes = (bytes: number): string => {
        if (bytes === -1) return '∞';
        if (bytes === 0) return '0 MB';
        const gb = bytes / (1024 * 1024 * 1024);
        const mb = bytes / (1024 * 1024);
        if (gb >= 1) return `${gb.toFixed(1)} GB`;
        if (mb >= 1) return `${mb.toFixed(0)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    const storagePercentage = !isUnlimited ? (safeUsedBytes / safeLimitBytes) * 100 : 0;
    // Minimum 2% width when there's any usage, so user can see something
    const displayPercentage = safeUsedBytes > 0 ? Math.max(storagePercentage, 2) : 0;

    return (
        <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
                <Text style={styles.storageTitle}>Depolama Alanı</Text>
                <Text style={styles.storageUsage}>
                    {formatBytes(safeUsedBytes)} / {formatBytes(limitBytes)}
                    {isUnlimited && ' (Sınırsız)'}
                </Text>
            </View>

            {isUnlimited ? (
                <View style={styles.unlimitedBar}>
                    <View style={styles.unlimitedBadge}>
                        <Ionicons name="infinite" size={20} color={Colors.light.primary} />
                        <Text style={styles.unlimitedText}>Sınırsız Depolama Alanı</Text>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.min(displayPercentage, 100)}%`,
                                    backgroundColor:
                                        storagePercentage > 90
                                            ? Colors.light.error
                                            : storagePercentage > 70
                                                ? Colors.light.warning
                                                : Colors.light.primary,
                                },
                            ]}
                        />
                    </View>
                    <Text style={styles.storagePercentage}>
                        %{storagePercentage.toFixed(1)} kullanıldı
                    </Text>
                    {storagePercentage > 80 && (
                        <Text style={styles.storageWarning}>
                            Depolama alanınız dolmak üzere
                        </Text>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    storageCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    storageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    storageTitle: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    storageUsage: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.light.borderLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    storageWarning: {
        fontSize: 12,
        color: Colors.light.warning,
        marginTop: 4,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    storagePercentage: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 8,
        textAlign: 'right',
        fontFamily: Typography.fontFamily.serifRegular,
    },
    unlimitedBar: {
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: Colors.light.primary + '10',
        borderRadius: 8,
        marginTop: 4,
    },
    unlimitedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unlimitedText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.primary,
        fontFamily: Typography.fontFamily.serif,
    },
});
