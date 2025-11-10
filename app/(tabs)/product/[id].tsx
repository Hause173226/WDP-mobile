import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
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
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import { Product } from '@/types/product';
import { listingService } from '@/services/listingService';
import { vehicleService } from '@/services/vehicleService';
import { useUserStore } from '@/store/userStore';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');

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

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isAuthenticated, user } = useUserStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [listingStatus, setListingStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Lỗi', 'ID sản phẩm không hợp lệ');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const response = await listingService.getListingById(id);

      // Lưu status riêng
      setListingStatus(response.status || '');

      // Map listing response sang Product format
      const mappedProduct = mapListingToProduct(response);
      setProduct(mappedProduct);
    } catch (error: any) {
      console.error('Error loading product:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          'Không thể tải thông tin sản phẩm. Vui lòng thử lại.',
        [
          {
            text: 'Quay lại',
            onPress: () => router.back(),
          },
          {
            text: 'Thử lại',
            onPress: () => loadProduct(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const showInsufficientBalanceDialog = (
    requiredAmount: number,
    currentBalance: number,
    missingAmount: number,
    vnpayUrl: string
  ) => {
    Alert.alert(
      'Số dư không đủ',
      `Tổng tiền cần đặt cọc: ${formatPrice(
        requiredAmount
      )}\n\nSố dư hiện tại: ${formatPrice(
        currentBalance
      )}\n\nBạn chỉ cần nạp thêm: ${formatPrice(
        missingAmount
      )}\n\nBạn có muốn nạp trực tiếp ${formatPrice(
        missingAmount
      )} vào ví để đặt cọc không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nạp tiền',
          onPress: async () => {
            try {
              await Linking.openURL(vnpayUrl);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể mở trang thanh toán');
            }
          },
        },
      ]
    );
  };

  const handleDeposit = () => {
    if (depositLoading) return;

    if (!isAuthenticated) {
      Alert.alert('Cần đăng nhập', 'Vui lòng đăng nhập để đặt cọc', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng nhập',
          onPress: () => router.push('/(auth)/login'),
        },
      ]);
      return;
    }

    if (!product || !id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm');
      return;
    }

    if (listingStatus === 'Sold' || listingStatus === 'InTransaction') {
      Alert.alert(
        'Không thể đặt cọc',
        listingStatus === 'Sold'
          ? 'Sản phẩm đã được bán'
          : 'Sản phẩm đang trong quá trình giao dịch'
      );
      return;
    }

    setDepositAmount('');
    setShowDepositModal(true);
  };

  const confirmDeposit = async () => {
    if (!product || !id) {
      return;
    }

    const minDeposit = Math.round(product.price * 0.1); // 10% giá xe
    const amount = parseInt(depositAmount.replace(/\D/g, ''), 10);

    if (!depositAmount || isNaN(amount) || amount < minDeposit) {
      Alert.alert(
        'Lỗi',
        `Số tiền phải lớn hơn hoặc bằng ${formatPrice(minDeposit)} (10% giá xe)`
      );
      return;
    }

    setDepositLoading(true);
    setShowDepositModal(false);

    try {
      const listingId = typeof id === 'string' ? id : id[0];
      const response = await vehicleService.createDeposit({
        listingId,
        depositAmount: amount,
      });

      if (response.success) {
        Alert.alert(
          'Đặt cọc thành công!',
          'Yêu cầu đặt cọc của bạn đã được gửi đến người bán, xin hãy kiểm tra mục 「Yêu cầu đặt cọc」thường xuyên!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else if (response.vnpayUrl) {
        // Số dư không đủ, BE trả về URL VNPay để nạp tiền
        const requiredAmount = response.requiredAmount || 0;
        const currentBalance = response.currentBalance || 0;
        const missingAmount =
          response.missingAmount || requiredAmount - currentBalance;

        showInsufficientBalanceDialog(
          requiredAmount,
          currentBalance,
          missingAmount,
          response.vnpayUrl || ''
        );
      } else {
        // Lỗi khác
        Alert.alert('Lỗi', response.message || 'Không thể tạo yêu cầu đặt cọc');
      }
    } catch (error: any) {
      console.error('Error creating deposit:', error);
      const axiosError = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            vnpayUrl?: string;
            requiredAmount?: number;
            currentBalance?: number;
            missingAmount?: number;
          };
        };
      };

      // Kiểm tra nếu có vnpayUrl trong response lỗi
      if (axiosError.response?.data?.vnpayUrl) {
        const requiredAmount = axiosError.response.data.requiredAmount || 0;
        const currentBalance = axiosError.response.data.currentBalance || 0;
        const missingAmount =
          axiosError.response.data.missingAmount ||
          requiredAmount - currentBalance;

        showInsufficientBalanceDialog(
          requiredAmount,
          currentBalance,
          missingAmount,
          axiosError.response.data.vnpayUrl || ''
        );
      } else if (
        axiosError.response?.data?.error?.includes(
          'freezeAmount is not a function'
        )
      ) {
        // Lỗi backend - walletService không có freezeAmount function
        Alert.alert(
          'Lỗi hệ thống',
          'Xin lỗi, hệ thống đang gặp lỗi kỹ thuật.\n\nVui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.'
        );
      } else {
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Không thể tạo yêu cầu đặt cọc';
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setDepositLoading(false);
      setDepositAmount('');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[600]} />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <Button title="Quay lại" onPress={() => router.back()} />
      </View>
    );
  }

  const specs = [
    {
      icon: Calendar,
      label: 'Năm sản xuất',
      value: product.year?.toString() || 'N/A',
    },
    {
      icon: Gauge,
      label: 'Số km đã đi',
      value: product.mileage ? `${product.mileage.toLocaleString()} km` : 'N/A',
    },
    {
      icon: Battery,
      label: 'Dung lượng pin',
      value: product.batteryCapacity ? `${product.batteryCapacity} kWh` : 'N/A',
    },
    { icon: MapPin, label: 'Vị trí', value: product.location },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>Không có hình ảnh</Text>
            </View>
          )}

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
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

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              {listingStatus === 'Published' && (
                <View style={styles.statusBadgePublished}>
                  <CheckCircle size={14} color={COLORS.success} />
                  <Text style={styles.statusBadgeTextPublished}>Đang bán</Text>
                </View>
              )}
              {listingStatus === 'InTransaction' && (
                <View style={styles.statusBadgeInTransaction}>
                  <Shield size={14} color={COLORS.warning} />
                  <Text style={styles.statusBadgeTextInTransaction}>
                    Đang giao dịch
                  </Text>
                </View>
              )}
              {listingStatus === 'Sold' && (
                <View style={styles.statusBadgeSold}>
                  <XCircle size={14} color={COLORS.error} />
                  <Text style={styles.statusBadgeTextSold}>Đã bán</Text>
                </View>
              )}
            </View>
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
                    {product.sellerRating?.toFixed(1) || '4.5'} (24 đánh giá)
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

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

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
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              depositLoading ||
              loading ||
              listingStatus === 'Sold' ||
              listingStatus === 'InTransaction'
                ? styles.depositButtonDisabled
                : styles.depositButton,
            ]}
            onPress={handleDeposit}
            disabled={
              depositLoading ||
              loading ||
              listingStatus === 'Sold' ||
              listingStatus === 'InTransaction'
            }
          >
            {depositLoading ? (
              <ActivityIndicator size="small" color={COLORS.secondary.white} />
            ) : (
              <Text
                style={[
                  depositLoading ||
                  loading ||
                  listingStatus === 'Sold' ||
                  listingStatus === 'InTransaction'
                    ? styles.depositButtonTextDisabled
                    : styles.depositButtonText,
                ]}
              >
                {listingStatus === 'Sold'
                  ? 'Đã bán'
                  : listingStatus === 'InTransaction'
                  ? 'Đang giao dịch'
                  : 'Đặt cọc'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.contactButtonFooter]}
            onPress={() => {
              Alert.alert(
                'Thông báo',
                'Tính năng liên hệ sẽ được triển khai sớm'
              );
            }}
          >
            <Text style={styles.contactButtonText}>Liên hệ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt cọc</Text>
            {product && (
              <>
                <Text style={styles.modalSubtitle}>
                  Giá xe: {formatPrice(product.price)}
                </Text>
                <Text style={styles.modalHint}>
                  Số tiền tối thiểu:{' '}
                  {formatPrice(Math.round(product.price * 0.1))} (10% giá xe)
                </Text>
              </>
            )}

            <TextInput
              style={styles.depositInput}
              placeholder="Nhập số tiền đặt cọc (VND)"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray[400]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDepositModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmDeposit}
              >
                <Text style={styles.modalButtonConfirmText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.gray[50],
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray[700],
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
  },
  placeholderImage: {
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.gray[500],
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
    marginBottom: 12,
  },
  statusBadgeContainer: {
    marginTop: 8,
  },
  statusBadgePublished: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5', // green-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeTextPublished: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46', // green-800
  },
  statusBadgeInTransaction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FED7AA', // orange-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeTextInTransaction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A3412', // orange-800
  },
  statusBadgeSold: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2', // red-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeTextSold: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B', // red-800
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
    padding: 16,
    backgroundColor: COLORS.secondary.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButton: {
    backgroundColor: COLORS.primary[600],
  },
  depositButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
  depositButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[500],
  },
  contactButtonFooter: {
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.primary[600],
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.secondary.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 16,
  },
  depositInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.gray[50],
    marginBottom: 20,
    color: COLORS.gray[900],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.gray[200],
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary[600],
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
});
