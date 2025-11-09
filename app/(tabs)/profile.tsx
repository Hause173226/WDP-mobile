import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Package, Heart, Bell, Circle as HelpCircle, LogOut, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary[900], COLORS.primary[600]]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Tài khoản</Text>
        </LinearGradient>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthText}>Vui lòng đăng nhập để tiếp tục</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    { icon: Package, label: 'Tin đã đăng', value: '3', onPress: () => {} },
    { icon: Heart, label: 'Tin đã lưu', value: '12', onPress: () => {} },
    { icon: Bell, label: 'Thông báo', onPress: () => {} },
    { icon: Settings, label: 'Cài đặt', onPress: () => {} },
    { icon: HelpCircle, label: 'Trợ giúp', onPress: () => {} },
  ];

  if (user.role === 'admin') {
    menuItems.unshift({
      icon: ShieldCheck,
      label: 'Quản trị',
      value: '',
      onPress: () => router.push('/(tabs)/admin'),
    });
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary[900], COLORS.primary[600]]}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.iconContainer}>
                    <Icon color={COLORS.primary[600]} size={24} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                {item.value && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.value}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={COLORS.error} size={24} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.secondary.white,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary.white,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.secondary.white,
    opacity: 0.9,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent.yellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuContainer: {
    backgroundColor: COLORS.secondary.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.gray[900],
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  notAuthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notAuthText: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
});
