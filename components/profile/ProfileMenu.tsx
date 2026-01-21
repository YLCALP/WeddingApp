import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface MenuItem {
    icon: string;
    label: string;
    onPress: () => void;
    isSwitch?: boolean;
    value?: boolean;
}

interface ProfileMenuProps {
    items: MenuItem[];
}

export function ProfileMenu({ items }: ProfileMenuProps) {
    return (
        <View style={styles.menuContainer}>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.isSwitch}
                >
                    <View style={styles.menuLeft}>
                        <Ionicons
                            name={item.icon as any}
                            size={22}
                            color={Colors.light.textSecondary}
                        />
                        <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    {item.isSwitch ? (
                        <View style={{ transform: [{ scale: 0.8 }] }}>
                            <Switch
                                trackColor={{ false: '#767577', true: Colors.light.primary }}
                                thumbColor={item.value ? 'white' : '#f4f3f4'}
                                onValueChange={item.onPress}
                                value={item.value}
                            />
                        </View>
                    ) : (
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={Colors.light.textMuted}
                        />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuLabel: {
        fontSize: 16,
        color: Colors.light.text,
    },
});
