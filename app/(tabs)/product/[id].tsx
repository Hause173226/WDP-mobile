import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  Gauge,
  Battery,
  Heart,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import { Product } from '@/services/api';

const { width } = Dimensions.get('window');

const MOCK_PRODUCT: Product = {
  id: '1',
  name: 'VinFast VF8 Plus 2023',
  description:
    'SUV điện cao cấp VinFast VF8 Plus với thiết kế hiện đại, động cơ mạnh mẽ và pin dung lượng lớn. Xe đã qua sử dụng nhẹ, bảo dưỡng định kỳ đầy đủ. Pin còn 95% dung lượng. Full option với các tính năng an toàn và tiện nghi cao cấp.',
  price: 1200000000,
  category: 'electric_vehicle',
  condition: 'like_new',
  brand: 'VinFast',
  model: 'VF8 Plus',
  year: 2023,
  batteryCapacity: 87.7,
  mileage: 5000,
  location: 'Hà Nội',
  images: [
    'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg',
    'https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg',
  ],
  sellerId: 'seller1',
  sellerName: 'Nguyễn Văn A',
  sellerRating: 4.8,
  featured: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product>(MOCK_PRODUCT);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const specs = [
    { icon: Calendar, label: 'Năm sản xuất', value: product.year?.toString() || 'N/A' },
    { icon: Gauge, label: 'Số km đã đi', value: `${product.mileage?.toLocaleString()} km` || 'N/A' },
    { icon: Battery, label: 'Dung lượng pin', value: `${product.batteryCapacity} kWh` || 'N/A' },
    { icon: MapPin, label: 'Vị trí', value: product.location },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <ArrowLeft color={COLORS.gray[900]} size={24} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                color={isFavorite ? COLORS.error : COLORS.gray[900]}
                size={24}
                fill={isFavorite ? COLORS.error : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          {product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image
                    source={{ uri: image }}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>
                  {product.sellerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sellerName}>{product.sellerName}</Text>
                <View style={styles.ratingContainer}>
                  <Star
                    color={COLORS.accent.yellow}
                    size={16}
                    fill={COLORS.accent.yellow}
                  />
                  <Text style={styles.rating}>
                    {product.sellerRating?.toFixed(1)} (24 đánh giá)
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Phone color={COLORS.primary[600]} size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <Mail color={COLORS.primary[600]} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
            <View style={styles.specsContainer}>
              {specs.map((spec, index) => {
                const Icon = spec.icon;
                return (
                  <View key={index} style={styles.specItem}>
                    <Icon color={COLORS.primary[600]} size={20} />
                    <View style={styles.specText}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tình trạng</Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>
                {product.condition === 'like_new'
                  ? 'Như mới'
                  : product.condition === 'good'
                    ? 'Tốt'
                    : product.condition === 'fair'
                      ? 'Khá'
                      : 'Mới'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Liên hệ mua hàng" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.accent.yellow,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  sellerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
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
  specsContainer: {
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  specText: {
    flex: 1,
  },
  specLabel: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[900],
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.gray[700],
  },
  conditionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.secondary.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
});
