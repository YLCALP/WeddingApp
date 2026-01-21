import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface Event {
    event_type: 'wedding' | 'engagement';
    partner1_name: string;
    partner2_name: string;
    event_date?: string;
    venue?: string;
}

interface EventCardProps {
    event: Event;
    onEditPress?: () => void;
}

export function EventCard({ event, onEditPress }: EventCardProps) {
    return (
        <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <View style={styles.eventBadge}>
                    <Ionicons
                        name={event.event_type === 'wedding' ? 'heart' : 'diamond'}
                        size={14}
                        color={Colors.light.primary}
                    />
                    <Text style={styles.eventBadgeText}>
                        {event.event_type === 'wedding' ? 'Düğün' : 'Nişan'}
                    </Text>
                </View>
                {onEditPress && (
                    <TouchableOpacity style={styles.editEventButton} onPress={onEditPress}>
                        <Ionicons name="pencil-outline" size={16} color={Colors.light.text} />
                        <Text style={styles.editEventButtonText}>Düzenle</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.eventTitle}>
                {event.partner1_name} & {event.partner2_name}
            </Text>

            {event.event_date && (
                <View style={styles.eventDetail}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.light.textSecondary} />
                    <Text style={styles.eventDetailText}>
                        {new Date(event.event_date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            )}

            {event.venue && (
                <View style={styles.eventDetail}>
                    <Ionicons name="location-outline" size={16} color={Colors.light.textSecondary} />
                    <Text style={styles.eventDetailText}>{event.venue}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    eventCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    eventBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: Colors.light.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    eventBadgeText: {
        fontSize: 12,
        color: Colors.light.primary,
        fontFamily: Typography.fontFamily.serif,
    },
    eventTitle: {
        fontSize: 22,
        color: Colors.light.text,
        marginBottom: 12,
        fontFamily: Typography.fontFamily.serif,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    eventDetailText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    editEventButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        gap: 6,
    },
    editEventButtonText: {
        fontSize: 13,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serif,
    },
});
