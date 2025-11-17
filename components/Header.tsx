import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showNotifications?: boolean;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
}

export default function Header({
  title,
  showBack = false,
  showNotifications = false,
  onBackPress,
  onNotificationPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[COLORS.primary[900], COLORS.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.header, { paddingTop: (insets.top ?? 0) + 12 }]}
    >
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <ArrowLeft color={COLORS.secondary.white} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}

        <Text style={styles.title}>{title}</Text>

        {showNotifications ? (
          <TouchableOpacity
            onPress={onNotificationPress}
            style={styles.iconButton}
          >
            <Bell color={COLORS.secondary.white} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
