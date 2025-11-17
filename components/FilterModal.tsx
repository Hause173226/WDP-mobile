import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

export interface FilterOptions {
  type: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  year: string;
  mileageKm: string;
  batteryCapacityKWh: string;
  city: string;
  district: string;
  condition: string;
  sortBy: string;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterOptions;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  onClear: () => void;
}

export default function FilterModal({
  visible,
  filters,
  onClose,
  onApply,
  onClear,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] =
    React.useState<FilterOptions>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key: keyof FilterOptions, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const types = [
    { value: '', label: 'Tất cả loại' },
    { value: 'Car', label: 'Ô tô điện' },
    { value: 'Battery', label: 'Pin xe điện' },
  ];

  const makes = ['Tesla', 'VinFast', 'Honda', 'Toyota', 'Hyundai', 'BYD'];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
  const cities = ['Hà Nội', 'HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
  const conditions = [
    { value: '', label: 'Tất cả' },
    { value: 'New', label: 'Mới' },
    { value: 'LikeNew', label: 'Như mới' },
    { value: 'Used', label: 'Đã qua sử dụng' },
  ];
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price_low', label: 'Giá thấp đến cao' },
    { value: 'price_high', label: 'Giá cao đến thấp' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bộ lọc tìm kiếm</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color={COLORS.gray[700]} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Loại sản phẩm</Text>
            <View style={styles.pickerContainer}>
              {types.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    localFilters.type === type.value && styles.chipActive,
                  ]}
                  onPress={() => handleChange('type', type.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.type === type.value && styles.chipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Make */}
          <View style={styles.section}>
            <Text style={styles.label}>Hãng xe</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    localFilters.make === '' && styles.chipActive,
                  ]}
                  onPress={() => handleChange('make', '')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.make === '' && styles.chipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {makes.map((make) => (
                  <TouchableOpacity
                    key={make}
                    style={[
                      styles.chip,
                      localFilters.make === make && styles.chipActive,
                    ]}
                    onPress={() => handleChange('make', make)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.make === make && styles.chipTextActive,
                      ]}
                    >
                      {make}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Model */}
          <View style={styles.section}>
            <Text style={styles.label}>Model xe</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập model"
              placeholderTextColor={COLORS.gray[400]}
              value={localFilters.model}
              onChangeText={(text) => handleChange('model', text)}
            />
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.label}>Khoảng giá (VNĐ)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Từ"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="numeric"
                value={localFilters.minPrice}
                onChangeText={(text) => handleChange('minPrice', text)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Đến"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="numeric"
                value={localFilters.maxPrice}
                onChangeText={(text) => handleChange('maxPrice', text)}
              />
            </View>
          </View>

          {/* Year */}
          <View style={styles.section}>
            <Text style={styles.label}>Năm sản xuất</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    localFilters.year === '' && styles.chipActive,
                  ]}
                  onPress={() => handleChange('year', '')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.year === '' && styles.chipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.chip,
                      localFilters.year === year.toString() &&
                        styles.chipActive,
                    ]}
                    onPress={() => handleChange('year', year.toString())}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.year === year.toString() &&
                          styles.chipTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Mileage */}
          <View style={styles.section}>
            <Text style={styles.label}>Số km đã chạy (tối đa)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 50000"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              value={localFilters.mileageKm}
              onChangeText={(text) => handleChange('mileageKm', text)}
            />
          </View>

          {/* Battery Capacity */}
          <View style={styles.section}>
            <Text style={styles.label}>Dung lượng pin (kWh)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 75"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              value={localFilters.batteryCapacityKWh}
              onChangeText={(text) => handleChange('batteryCapacityKWh', text)}
            />
          </View>

          {/* City */}
          <View style={styles.section}>
            <Text style={styles.label}>Thành phố</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    localFilters.city === '' && styles.chipActive,
                  ]}
                  onPress={() => handleChange('city', '')}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.city === '' && styles.chipTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.chip,
                      localFilters.city === city && styles.chipActive,
                    ]}
                    onPress={() => handleChange('city', city)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        localFilters.city === city && styles.chipTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* District */}
          <View style={styles.section}>
            <Text style={styles.label}>Quận/Huyện</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập quận/huyện"
              placeholderTextColor={COLORS.gray[400]}
              value={localFilters.district}
              onChangeText={(text) => handleChange('district', text)}
            />
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={styles.label}>Tình trạng xe</Text>
            <View style={styles.pickerContainer}>
              {conditions.map((cond) => (
                <TouchableOpacity
                  key={cond.value}
                  style={[
                    styles.chip,
                    localFilters.condition === cond.value && styles.chipActive,
                  ]}
                  onPress={() => handleChange('condition', cond.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.condition === cond.value &&
                        styles.chipTextActive,
                    ]}
                  >
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.label}>Sắp xếp theo</Text>
            <View style={styles.pickerContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    localFilters.sortBy === option.value && styles.chipActive,
                  ]}
                  onPress={() => handleChange('sortBy', option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      localFilters.sortBy === option.value &&
                        styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: COLORS.secondary.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.secondary.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.secondary.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  chipActive: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  chipTextActive: {
    color: COLORS.secondary.white,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.secondary.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary[600],
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.white,
  },
});
