import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import Card from '@/components/Card';
import SearchBar from '@/components/SearchBar';
import FilterModal, { FilterOptions } from '@/components/FilterModal';
import { Product } from '@/types/product';
import { listingService } from '@/services/listingService';
import Header from '@/components/Header';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// Helper function to map Listing from API to Product type
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
    sellerRating: 4.5,
    featured: listing.status === 'Published' || listing.featured === true,
    status: listing.status || 'Published',
    createdAt: listing.createdAt || new Date().toISOString(),
    updatedAt: listing.updatedAt || new Date().toISOString(),
  };
};

export default function SearchScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    type: '',
    make: '',
    model: '',
    minPrice: '',
    maxPrice: '',
    year: '',
    mileageKm: '',
    batteryCapacityKWh: '',
    city: '',
    district: '',
    condition: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    loadProducts();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    // Reset to page 1 when search query changes
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else {
      loadProducts();
    }
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const params: Record<string, string | number | undefined | null> = {
        page: pagination.currentPage,
        limit: 12,
        sortBy: filters.sortBy,
      };

      // Apply filters
      if (filters.type) params.type = filters.type;
      if (filters.make) params.make = filters.make;
      if (filters.model) params.model = filters.model;
      if (filters.year) params.year = filters.year;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.mileageKm) params.mileageKm = filters.mileageKm;
      if (filters.batteryCapacityKWh)
        params.batteryCapacityKWh = filters.batteryCapacityKWh;
      if (filters.city) params.city = filters.city;
      if (filters.district) params.district = filters.district;
      if (filters.condition) params.condition = filters.condition;

      // Apply search query
      if (searchQuery) params.keyword = searchQuery;

      const response = await listingService.getListings(params);

      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 12,
        }
      );

      const listings = response.listings || response.data?.listings || [];
      const mappedProducts = listings.map(mapListingToProduct);

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          'Không thể tải danh sách sản phẩm. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadProducts();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      make: '',
      model: '',
      minPrice: '',
      maxPrice: '',
      year: '',
      mileageKm: '',
      batteryCapacityKWh: '',
      city: '',
      district: '',
      condition: '',
      sortBy: 'newest',
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          onPress={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          style={[
            styles.paginationButton,
            !pagination.hasPrevPage && styles.paginationButtonDisabled,
          ]}
        >
          <ChevronLeft
            color={pagination.hasPrevPage ? COLORS.gray[700] : COLORS.gray[400]}
            size={20}
          />
        </TouchableOpacity>

        {/* Page Numbers */}
        {startPage > 1 && (
          <TouchableOpacity
            onPress={() => handlePageChange(1)}
            style={styles.paginationButton}
          >
            <Text style={styles.paginationButtonText}>1</Text>
          </TouchableOpacity>
        )}

        {startPage > 2 && (
          <View style={styles.paginationDots}>
            <Text style={styles.paginationDotsText}>...</Text>
          </View>
        )}

        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => handlePageChange(page)}
            style={[
              styles.paginationButton,
              page === pagination.currentPage && styles.paginationButtonActive,
            ]}
          >
            <Text
              style={[
                styles.paginationButtonText,
                page === pagination.currentPage &&
                  styles.paginationButtonTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}

        {endPage < pagination.totalPages - 1 && (
          <View style={styles.paginationDots}>
            <Text style={styles.paginationDotsText}>...</Text>
          </View>
        )}

        {endPage < pagination.totalPages && (
          <TouchableOpacity
            onPress={() => handlePageChange(pagination.totalPages)}
            style={styles.paginationButton}
          >
            <Text style={styles.paginationButtonText}>
              {pagination.totalPages}
            </Text>
          </TouchableOpacity>
        )}

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          style={[
            styles.paginationButton,
            !pagination.hasNextPage && styles.paginationButtonDisabled,
          ]}
        >
          <ChevronRight
            color={pagination.hasNextPage ? COLORS.gray[700] : COLORS.gray[400]}
            size={20}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.year) count++;
    if (filters.mileageKm) count++;
    if (filters.batteryCapacityKWh) count++;
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.condition) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      <Header title="Tìm kiếm sản phẩm" showNotifications={false} />

      <SearchBar
        onSearch={handleSearch}
        value={searchQuery}
        onFilterPress={handleFilterPress}
      />

      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {activeFiltersCount} bộ lọc đang áp dụng
          </Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary[600]} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Tìm thấy{' '}
                <Text style={styles.bold}>{pagination.totalCount}</Text> kết quả
              </Text>
              {pagination.totalPages > 1 && (
                <Text style={styles.pageInfo}>
                  Trang {pagination.currentPage}/{pagination.totalPages}
                </Text>
              )}
            </View>

            {products.map((product) => (
              <Card
                key={product.id}
                product={product}
                onPress={() => router.push(`/(tabs)/product/${product.id}`)}
              />
            ))}

            {renderPagination()}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        filters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary[100],
  },
  activeFiltersText: {
    fontSize: 14,
    color: COLORS.primary[700],
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
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
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.secondary.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonActive: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[200],
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  paginationButtonTextActive: {
    color: COLORS.secondary.white,
  },
  paginationDots: {
    paddingHorizontal: 4,
  },
  paginationDotsText: {
    fontSize: 14,
    color: COLORS.gray[500],
  },
});
