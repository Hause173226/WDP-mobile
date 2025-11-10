import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { Product } from '@/types/product';

interface CardProps {
  product: Product;
  onPress: () => void;
}

export default function Card({ product, onPress }: CardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = () => {
    if (!product.status) return null;

    if (product.status === 'Sold') {
      return (
        <View style={styles.statusBadgeSold}>
          <Text style={styles.statusBadgeText}>Đã bán</Text>
        </View>
      );
    }

    if (product.status === 'InTransaction') {
      return (
        <View style={styles.statusBadgeInTransaction}>
          <Text style={styles.statusBadgeText}>Đang giao dịch</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              product.images[0] ||
              'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Status Badge - hiển thị ở góc trên bên trái */}
        {getStatusBadge()}
        {/* Featured Badge - hiển thị ở góc trên bên phải */}
        {product.featured &&
          product.status !== 'Sold' &&
          product.status !== 'InTransaction' && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Nổi bật</Text>
            </View>
          )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <MapPin color={COLORS.gray[500]} size={14} />
            <Text style={styles.location} numberOfLines={1}>
              {product.location}
            </Text>
          </View>

          {product.sellerRating && (
            <View style={styles.ratingContainer}>
              <Star
                color={COLORS.accent.yellow}
                size={14}
                fill={COLORS.accent.yellow}
              />
              <Text style={styles.rating}>
                {product.sellerRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondary.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.accent.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredText: {
    color: COLORS.gray[900],
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadgeSold: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444', // Red
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeInTransaction: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F97316', // Orange
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: COLORS.secondary.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary[600],
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  location: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    color: COLORS.gray[700],
    fontWeight: '600',
  },
});
