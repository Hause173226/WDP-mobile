import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { api } from '@/services/api';
import { useUserStore } from '@/store/userStore';

export default function PostListingScreen() {
  const { user } = useUserStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'electric_vehicle' | 'battery' | 'parts'>('electric_vehicle');
  const [condition, setCondition] = useState<'new' | 'like_new' | 'good' | 'fair'>('good');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [mileage, setMileage] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const getSuggestedPrice = async () => {
    try {
      const suggested = await api.getSuggestedPrice({
        category,
        brand,
        model,
        year: parseInt(year),
        condition,
      });
      setPrice(suggested.toString());
      Alert.alert('Gợi ý giá', `Giá đề xuất: ${suggested.toLocaleString()} đ`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy giá gợi ý');
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !location || images.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và thêm ít nhất 1 hình ảnh');
      return;
    }

    setLoading(true);
    try {
      Alert.alert('Thành công', 'Đăng tin thành công! Tin của bạn đang chờ phê duyệt.');
      setName('');
      setDescription('');
      setPrice('');
      setBrand('');
      setModel('');
      setYear('');
      setBatteryCapacity('');
      setMileage('');
      setLocation('');
      setImages([]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng tin');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'electric_vehicle', label: 'Xe điện' },
    { value: 'battery', label: 'Pin' },
    { value: 'parts', label: 'Phụ tùng' },
  ];

  const conditions = [
    { value: 'new', label: 'Mới' },
    { value: 'like_new', label: 'Như mới' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Đăng tin" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <X color={COLORS.secondary.white} size={16} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Upload color={COLORS.primary[600]} size={32} />
              <Text style={styles.uploadText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionButton,
                  category === cat.value && styles.optionButtonActive,
                ]}
                onPress={() => setCategory(cat.value as any)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat.value && styles.optionTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tên sản phẩm</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: VinFast VF8 Plus 2023"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết về sản phẩm..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Hãng</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: VinFast"
              value={brand}
              onChangeText={setBrand}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: VF8 Plus"
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Năm sản xuất</Text>
            <TextInput
              style={styles.input}
              placeholder="2023"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Pin (kWh)</Text>
            <TextInput
              style={styles.input}
              placeholder="87.7"
              value={batteryCapacity}
              onChangeText={setBatteryCapacity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {category === 'electric_vehicle' && (
          <View style={styles.section}>
            <Text style={styles.label}>Số km đã đi</Text>
            <TextInput
              style={styles.input}
              placeholder="5000"
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tình trạng</Text>
          <View style={styles.optionsContainer}>
            {conditions.map((cond) => (
              <TouchableOpacity
                key={cond.value}
                style={[
                  styles.optionButton,
                  condition === cond.value && styles.optionButtonActive,
                ]}
                onPress={() => setCondition(cond.value as any)}
              >
                <Text
                  style={[
                    styles.optionText,
                    condition === cond.value && styles.optionTextActive,
                  ]}
                >
                  {cond.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.priceHeader}>
            <Text style={styles.label}>Giá (VNĐ)</Text>
            <TouchableOpacity onPress={getSuggestedPrice}>
              <Text style={styles.suggestButton}>Gợi ý giá AI</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="1200000000"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Vị trí</Text>
          <TextInput
            style={styles.input}
            placeholder="Hà Nội"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.submitSection}>
          <Button title="Đăng tin" onPress={handleSubmit} loading={loading} />
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
  content: {
    flex: 1,
    padding: 20,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  halfInput: {
    flex: 1,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
  },
  uploadText: {
    fontSize: 12,
    color: COLORS.primary[600],
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.secondary.white,
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  optionText: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  optionTextActive: {
    color: COLORS.secondary.white,
    fontWeight: '600',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestButton: {
    fontSize: 14,
    color: COLORS.accent.yellow,
    fontWeight: '600',
  },
  submitSection: {
    marginBottom: 40,
  },
});
