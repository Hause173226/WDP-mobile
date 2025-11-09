import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Package, DollarSign, TrendingUp, CircleCheck as CheckCircle, Circle as XCircle, Clock } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Header from '@/components/Header';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'listings'>('overview');

  const stats = [
    {
      icon: Users,
      label: 'Người dùng',
      value: '1,234',
      change: '+12%',
      color: COLORS.primary[600],
    },
    {
      icon: Package,
      label: 'Tin đăng',
      value: '567',
      change: '+8%',
      color: COLORS.accent.yellow,
    },
    {
      icon: DollarSign,
      label: 'Doanh thu',
      value: '2.5B đ',
      change: '+15%',
      color: COLORS.success,
    },
    {
      icon: TrendingUp,
      label: 'Giao dịch',
      value: '89',
      change: '+5%',
      color: COLORS.warning,
    },
  ];

  const pendingListings = [
    {
      id: '1',
      title: 'VinFast VF8 Plus 2023',
      seller: 'Nguyễn Văn A',
      date: '2 giờ trước',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Tesla Model 3 Long Range',
      seller: 'Trần Thị B',
      date: '5 giờ trước',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Pin LFP 60kWh',
      seller: 'Lê Văn C',
      date: '1 ngày trước',
      status: 'pending',
    },
  ];

  const recentUsers = [
    {
      id: '1',
      name: 'Phạm Thị D',
      email: 'pham.d@email.com',
      joined: '1 ngày trước',
      status: 'active',
    },
    {
      id: '2',
      name: 'Hoàng Văn E',
      email: 'hoang.e@email.com',
      joined: '2 ngày trước',
      status: 'active',
    },
  ];

  const handleApproveListing = (id: string) => {
    console.log('Approve listing:', id);
  };

  const handleRejectListing = (id: string) => {
    console.log('Reject listing:', id);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary[900], COLORS.primary[600]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quản trị hệ thống</Text>
        <Text style={styles.headerSubtitle}>Dashboard & Analytics</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
            Tổng quan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'users' && styles.tabActive]}
          onPress={() => setSelectedTab('users')}
        >
          <Text style={[styles.tabText, selectedTab === 'users' && styles.tabTextActive]}>
            Người dùng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'listings' && styles.tabActive]}
          onPress={() => setSelectedTab('listings')}
        >
          <Text style={[styles.tabText, selectedTab === 'listings' && styles.tabTextActive]}>
            Tin đăng
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && (
          <>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <View key={index} style={styles.statCard}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                      <Icon color={stat.color} size={24} />
                    </View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statChange}>{stat.change}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tin đăng chờ duyệt</Text>
              {pendingListings.map((listing) => (
                <View key={listing.id} style={styles.listingCard}>
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle}>{listing.title}</Text>
                    <Text style={styles.listingSeller}>Người bán: {listing.seller}</Text>
                    <Text style={styles.listingDate}>{listing.date}</Text>
                  </View>
                  <View style={styles.listingActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveListing(listing.id)}
                    >
                      <CheckCircle color={COLORS.secondary.white} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectListing(listing.id)}
                    >
                      <XCircle color={COLORS.secondary.white} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {selectedTab === 'users' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người dùng mới</Text>
            {recentUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitial}>{user.name.charAt(0)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <Text style={styles.userJoined}>Tham gia {user.joined}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'listings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản lý tin đăng</Text>
            {pendingListings.map((listing) => (
              <View key={listing.id} style={styles.listingCard}>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{listing.title}</Text>
                  <Text style={styles.listingSeller}>Người bán: {listing.seller}</Text>
                  <Text style={styles.listingDate}>{listing.date}</Text>
                </View>
                <View style={styles.listingActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApproveListing(listing.id)}
                  >
                    <CheckCircle color={COLORS.secondary.white} size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectListing(listing.id)}
                  >
                    <XCircle color={COLORS.secondary.white} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary.white,
    opacity: 0.9,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  tabTextActive: {
    color: COLORS.secondary.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.secondary.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  listingSeller: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  listingDate: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  userJoined: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
});
