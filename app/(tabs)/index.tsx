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
import { Zap, Battery } from 'lucide-react-native';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Fetch tất cả listings
      const params: Record<string, string | number | undefined | null> = {
        page: 1,
        limit: 20,
        sortBy: 'newest',
      };

      // Thêm filter category nếu có
      if (selectedCategory === 'electric_vehicle') {
        params.type = 'Car';
      } else if (selectedCategory === 'battery') {
        params.type = 'Battery';
      }

      // Thêm keyword search nếu có
      if (searchQuery) {
        params.keyword = searchQuery;
      }

      const response = await listingService.getListings(params);

      // Map listings sang Product format
      const listings = response.listings || response.data?.listings || [];
      const mappedProducts = listings.map(mapListingToProduct);

      setProducts(mappedProducts);

      // Lọc featured products (status Published hoặc có flag featured)
      const featured = mappedProducts.filter(
        (p: any) => p.featured || (p.sellerRating && p.sellerRating >= 4.5)
      );
      setFeaturedProducts(featured.slice(0, 5)); // Lấy 5 tin nổi bật đầu tiên
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

  // Reload khi search hoặc category thay đổi
  useEffect(() => {
    if (!loading) {
      loadProducts();
    }
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const categories = [
    { id: 'electric_vehicle', name: 'Xe điện', icon: Zap },
    { id: 'battery', name: 'Pin', icon: Battery },
  ];

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

      <SearchBar
        onSearch={handleSearch}
        value={searchQuery}
        onFilterPress={() => {}}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <Icon
                  color={
                    selectedCategory === category.id
                      ? COLORS.secondary.white
                      : COLORS.primary[600]
                  }
                  size={32}
                />
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.id &&
                      styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tin nổi bật</Text>
                {featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                  />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
              {products.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không tìm thấy sản phẩm nào
                  </Text>
                </View>
              ) : (
                products.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                  />
                ))
              )}
            </View>
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
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: COLORS.secondary.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCardActive: {
    backgroundColor: COLORS.primary[600],
  },
  categoryName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[800],
  },
  categoryNameActive: {
    color: COLORS.secondary.white,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 16,
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
