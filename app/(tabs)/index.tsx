import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Battery, Search } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import { api, Product } from '@/services/api';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'VinFast VF8 Plus 2023',
    description: 'SUV điện cao cấp, pin 87.7kWh',
    price: 1200000000,
    category: 'electric_vehicle',
    condition: 'like_new',
    brand: 'VinFast',
    model: 'VF8 Plus',
    year: 2023,
    batteryCapacity: 87.7,
    mileage: 5000,
    location: 'Hà Nội',
    images: ['https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'],
    sellerId: 'seller1',
    sellerName: 'Nguyễn Văn A',
    sellerRating: 4.8,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Pin LFP 60kWh',
    description: 'Pin sắt lithium phosphate, còn mới 95%',
    price: 150000000,
    category: 'battery',
    condition: 'good',
    batteryCapacity: 60,
    location: 'TP.HCM',
    images: ['https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg'],
    sellerId: 'seller2',
    sellerName: 'Trần Thị B',
    sellerRating: 4.5,
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Tesla Model 3 Long Range',
    description: 'Xe nhập Mỹ, full option, pin còn 92%',
    price: 1500000000,
    category: 'electric_vehicle',
    condition: 'good',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2022,
    batteryCapacity: 82,
    mileage: 15000,
    location: 'Đà Nẵng',
    images: ['https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg'],
    sellerId: 'seller3',
    sellerName: 'Lê Văn C',
    sellerRating: 4.9,
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts(MOCK_PRODUCTS);
      setFeaturedProducts(MOCK_PRODUCTS.filter((p) => p.featured));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      setProducts(filtered);
    } else {
      setProducts(MOCK_PRODUCTS);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const filtered = MOCK_PRODUCTS.filter((p) => p.category === category);
    setProducts(filtered);
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
                    selectedCategory === category.id && styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
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
});
