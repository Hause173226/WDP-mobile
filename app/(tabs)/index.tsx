import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import { Product } from '@/types/product';
import { listingService } from '@/services/listingService';

// Helper function để map Listing từ API sang Product type
const mapListingToProduct = (listing: any): Product => {
  return {
    id: listing._id,
    name: `${listing.make} ${listing.model} ${listing.year}`,
    description: listing.description || '',
    price: listing.priceListed,
    category:
      listing.type === 'Car'
        ? 'electric_vehicle'
        : listing.type === 'Battery'
        ? 'battery'
        : 'parts',
    condition: listing.condition?.toLowerCase() || 'good',
    brand: listing.make,
    model: listing.model,
    year: listing.year,
    batteryCapacity: listing.batteryCapacityKWh,
    mileage: listing.mileageKm,
    location:
      `${listing.location?.district || ''}, ${
        listing.location?.city || ''
      }`.trim() || 'N/A',
    images: listing.photos?.map((p: any) => p.url) || [],
    sellerId: listing.sellerId?._id || listing.sellerId || '',
    sellerName: listing.sellerId?.fullName || 'Người bán',
    sellerRating: 4.5, // Default rating, có thể lấy từ API nếu có
    featured: listing.status === 'Published' || listing.featured === true,
    status: listing.status || 'Published', // Lưu status từ API
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: listing.updatedAt || new Date().toISOString(),
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Fetch latest products
      const latestParams = {
        page: 1,
        limit: 10,
        sortBy: 'newest',
      };

      const latestResponse = await listingService.getListings(latestParams);
      const latestListings =
        latestResponse.listings || latestResponse.data?.listings || [];
      const mappedLatest = latestListings.map(mapListingToProduct);
      setLatestProducts(mappedLatest);

      // Get featured products (first 5 from latest)
      const featured = mappedLatest.filter(
        (p: any) => p.featured || (p.sellerRating && p.sellerRating >= 4.5)
      );
      setFeaturedProducts(featured.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFocus = () => {
    // Navigate to search tab when search is focused
    router.push('/(tabs)/search');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary[900], COLORS.primary[600]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>EV Marketplace</Text>
        <Text style={styles.headerSubtitle}>
          Nền tảng giao dịch xe điện & pin{' '}
          <Text style={styles.highlight}>hàng đầu Việt Nam</Text>
        </Text>
      </LinearGradient>

      <TouchableOpacity onPress={handleSearchFocus} activeOpacity={1}>
        <View pointerEvents="none">
          <SearchBar onSearch={() => {}} value="" onFilterPress={() => {}} />
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⭐ Tin nổi bật</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/search')}
                  >
                    <Text style={styles.seeAllText}>Xem tất cả →</Text>
                  </TouchableOpacity>
                </View>
                {featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                  />
                ))}
              </View>
            )}

            {latestProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🆕 Mới nhất</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/search')}
                  >
                    <Text style={styles.seeAllText}>Xem tất cả →</Text>
                  </TouchableOpacity>
                </View>
                {latestProducts.slice(0, 8).map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                  />
                ))}
              </View>
            )}

            {!loading && latestProducts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
              </View>
            )}
          </>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.secondary.white,
    opacity: 0.95,
  },
  highlight: {
    color: COLORS.accent.yellow,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
  },
});
