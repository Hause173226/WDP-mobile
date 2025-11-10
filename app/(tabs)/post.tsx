import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Upload, X, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useUserStore } from '@/store/userStore';
import { listingService } from '@/services/listingService';

type ExistingPhoto = { url: string; kind?: string; publicId?: string };

export default function PostListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.edit as string | undefined;
  const { user } = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState<boolean>(!!editId);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    type: '',
    make: '',
    model: '',
    year: '',
    priceListed: '',
    // Vehicle Details
    mileageKm: '',
    batteryCapacityKWh: '',
    chargeCycles: '0',
    condition: '',
    // Car-only
    licensePlate: '',
    engineDisplacementCc: '',
    vehicleType: '',
    paintColor: '',
    engineNumber: '',
    chassisNumber: '',
    otherFeatures: '',
    // Location
    city: '',
    district: '',
    address: '',
    // Other
    tradeMethod: 'meet',
    images: [] as ImagePicker.ImagePickerAsset[],
  });

  // Ảnh preview cho ảnh mới
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  // Ảnh đã có trên server
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<
    'type' | 'condition' | 'city' | 'tradeMethod' | null
  >(null);
  const [pickerOptions, setPickerOptions] = useState<
    { label: string; value: string }[]
  >([]);

  /* ======================= Prefill khi edit ======================= */
  useEffect(() => {
    const fetchMine = async () => {
      if (!editId) return;

      try {
        setIsLoadingPrefill(true);
        const res = await listingService.getMyListing(editId);
        const l = res;

        // Map -> formData
        setFormData((prev) => ({
          ...prev,
          type: l.type ?? '',
          make: l.make ?? '',
          model: l.model ?? '',
          year: l.year ? String(l.year) : '',
          priceListed: l.priceListed != null ? String(l.priceListed) : '',
          mileageKm: l.mileageKm != null ? String(l.mileageKm) : '',
          batteryCapacityKWh:
            l.batteryCapacityKWh != null ? String(l.batteryCapacityKWh) : '',
          chargeCycles: l.chargeCycles != null ? String(l.chargeCycles) : '0',
          condition: l.condition ?? '',
          licensePlate: l.licensePlate ?? '',
          engineDisplacementCc:
            l.engineDisplacementCc != null
              ? String(l.engineDisplacementCc)
              : '',
          vehicleType: l.vehicleType ?? '',
          paintColor: l.paintColor ?? '',
          engineNumber: l.engineNumber ?? '',
          chassisNumber: l.chassisNumber ?? '',
          otherFeatures: l.otherFeatures ?? '',
          city: l.location?.city ?? '',
          district: l.location?.district ?? '',
          address: l.location?.address ?? '',
          tradeMethod: l.tradeMethod ?? 'meet',
          images: [],
        }));

        setExistingPhotos(Array.isArray(l.photos) ? l.photos : []);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          'Không load được dữ liệu tin của bạn.';
        Alert.alert('Lỗi tải dữ liệu', msg);
        router.back();
      } finally {
        setIsLoadingPrefill(false);
      }
    };

    fetchMine();
  }, [editId, router]);

  /* ======================= Validate theo bước ======================= */
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (!formData.type) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng chọn loại sản phẩm');
          return false;
        }
        if (!formData.make.trim()) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng nhập hãng');
          return false;
        }
        if (!formData.model.trim()) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng nhập model');
          return false;
        }
        const y = parseInt(formData.year);
        if (!formData.year || !Number.isFinite(y) || y < 1900 || y > 2025) {
          Alert.alert(
            'Thiếu thông tin!',
            'Vui lòng nhập năm sản xuất hợp lệ (1900-2025)'
          );
          return false;
        }
        if (!formData.priceListed || parseFloat(formData.priceListed) <= 0) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng nhập giá bán hợp lệ');
          return false;
        }
        return true;
      }
      case 2: {
        if (formData.type === 'Car') {
          if (formData.mileageKm === '' || parseFloat(formData.mileageKm) < 0) {
            Alert.alert('Thiếu thông tin!', 'Vui lòng nhập số km đã chạy');
            return false;
          }
        }
        if (formData.type === 'Battery') {
          if (
            !formData.batteryCapacityKWh ||
            parseFloat(formData.batteryCapacityKWh) <= 0
          ) {
            Alert.alert(
              'Thiếu thông tin!',
              'Vui lòng nhập dung lượng pin (kWh)'
            );
            return false;
          }
        }
        if (!formData.condition) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng chọn tình trạng');
          return false;
        }
        return true;
      }
      case 3: {
        if (!editId && formData.images.length < 3) {
          Alert.alert('Thiếu hình ảnh!', 'Vui lòng tải lên ít nhất 3 hình ảnh');
          return false;
        }
        if (editId && existingPhotos.length + formData.images.length < 3) {
          Alert.alert(
            'Cần tối thiểu 3 ảnh khi gửi duyệt',
            'Bạn có thể tiếp tục lưu nháp, nhưng khi gửi duyệt sẽ cần đủ 3 ảnh.'
          );
        }
        return true;
      }
      case 4: {
        if (!formData.city) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng chọn thành phố');
          return false;
        }
        if (!formData.district.trim()) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng nhập quận/huyện');
          return false;
        }
        if (!formData.address.trim()) {
          Alert.alert('Thiếu thông tin!', 'Vui lòng nhập địa chỉ chi tiết');
          return false;
        }
        if (!['meet', 'ship', 'consignment'].includes(formData.tradeMethod)) {
          Alert.alert(
            'Phương thức giao dịch!',
            'Hãy chọn meet/ship/consignment'
          );
          return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(4, currentStep + 1));
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openPicker = (
    type: 'type' | 'condition' | 'city' | 'tradeMethod',
    options: { label: string; value: string }[]
  ) => {
    setPickerType(type);
    setPickerOptions(options);
    setPickerVisible(true);
  };

  const selectPickerValue = (value: string) => {
    if (pickerType) {
      handleInputChange(pickerType, value);
    }
    setPickerVisible(false);
    setPickerType(null);
  };

  /* ======================= Upload ảnh mới ======================= */
  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...formData.images, ...result.assets].slice(0, 10);
      setFormData((prev) => ({ ...prev, images: newImages }));
      const newPreviewUrls = result.assets.map((asset) => asset.uri);
      setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreviewUrls(newPreviewUrls);
  };

  /* ======================= XÓA ẢNH CŨ ======================= */
  const removeExistingPhoto = async (publicId?: string) => {
    if (!editId) return;
    if (!publicId) {
      Alert.alert('Lỗi', 'Không tìm thấy publicId ảnh');
      return;
    }

    Alert.alert('Xoá ảnh?', 'Bạn chắc chắn muốn xoá ảnh này khỏi tin?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          try {
            await listingService.deletePhoto(editId, publicId);
            setExistingPhotos((prev) =>
              prev.filter((p) => p.publicId !== publicId)
            );
            Alert.alert('Thành công', 'Đã xoá ảnh');
          } catch (err: any) {
            const msg = err?.response?.data?.message || 'Không xoá được ảnh.';
            Alert.alert('Lỗi xoá ảnh', msg);
          }
        },
      },
    ]);
  };

  /* ======================= Submit ======================= */
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let listingId = editId || '';

      // ---------- EDIT MODE ----------
      if (editId) {
        const fd = new FormData();

        if (formData.type) fd.append('type', formData.type);
        if (formData.make) fd.append('make', formData.make);
        if (formData.model) fd.append('model', formData.model);
        if (formData.year) fd.append('year', formData.year);
        if (formData.batteryCapacityKWh)
          fd.append('batteryCapacityKWh', formData.batteryCapacityKWh);
        if (formData.mileageKm) fd.append('mileageKm', formData.mileageKm);
        if (formData.chargeCycles)
          fd.append('chargeCycles', formData.chargeCycles);

        if (formData.type === 'Car') {
          if (formData.licensePlate)
            fd.append('licensePlate', formData.licensePlate);
          if (formData.engineDisplacementCc)
            fd.append('engineDisplacementCc', formData.engineDisplacementCc);
          if (formData.vehicleType)
            fd.append('vehicleType', formData.vehicleType);
          if (formData.paintColor) fd.append('paintColor', formData.paintColor);
          if (formData.engineNumber)
            fd.append('engineNumber', formData.engineNumber);
          if (formData.chassisNumber)
            fd.append('chassisNumber', formData.chassisNumber);
          if (formData.otherFeatures)
            fd.append('otherFeatures', formData.otherFeatures);
        }

        if (formData.condition) fd.append('condition', formData.condition);
        if (formData.priceListed)
          fd.append('priceListed', formData.priceListed);
        if (formData.tradeMethod)
          fd.append('tradeMethod', formData.tradeMethod);

        fd.append(
          'location',
          JSON.stringify({
            city: formData.city,
            district: formData.district,
            address: formData.address,
          })
        );

        // Ảnh mới
        formData.images.forEach((img) => {
          const uriParts = img.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          fd.append('photos', {
            uri: img.uri,
            type: `image/${fileType}`,
            name: `photo.${fileType}`,
          } as any);
        });

        try {
          await listingService.updateListing(editId, fd);
          Alert.alert('Thành công!', 'Tin của bạn đã được lưu.');

          if (existingPhotos.length + formData.images.length < 3) {
            Alert.alert(
              'Thiếu ảnh để gửi duyệt',
              'Tin chưa đủ 3 ảnh. Bạn cần bổ sung trước khi gửi duyệt.'
            );
            router.back();
            return;
          }

          Alert.alert('Gửi duyệt ngay?', '', [
            { text: 'Để sau', style: 'cancel', onPress: () => router.back() },
            {
              text: 'Gửi duyệt',
              onPress: async () => {
                try {
                  await listingService.submitForReview(editId);
                  Alert.alert('Thành công', 'Đã gửi duyệt!');
                  router.back();
                } catch (error: any) {
                  const msg =
                    error?.response?.data?.message ||
                    'Không thể gửi duyệt tin đăng.';
                  Alert.alert('Lỗi gửi duyệt!', msg);
                }
              },
            },
          ]);
          return;
        } catch (err: any) {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.errors?.[0]?.msg ||
            `HTTP ${err?.response?.status || ''} - Không rõ lỗi`;
          Alert.alert('Thao tác thất bại!', msg);
          return;
        }
      }

      // ---------- CREATE MODE ----------
      const fd = new FormData();

      fd.append('type', formData.type);
      fd.append('make', formData.make);
      fd.append('model', formData.model);
      fd.append('year', formData.year);
      if (formData.batteryCapacityKWh)
        fd.append('batteryCapacityKWh', formData.batteryCapacityKWh);
      fd.append('mileageKm', formData.mileageKm || '0');
      fd.append('chargeCycles', formData.chargeCycles || '0');

      if (formData.type === 'Car') {
        if (formData.licensePlate)
          fd.append('licensePlate', formData.licensePlate);
        if (formData.engineDisplacementCc)
          fd.append('engineDisplacementCc', formData.engineDisplacementCc);
        if (formData.vehicleType)
          fd.append('vehicleType', formData.vehicleType);
        if (formData.paintColor) fd.append('paintColor', formData.paintColor);
        if (formData.engineNumber)
          fd.append('engineNumber', formData.engineNumber);
        if (formData.chassisNumber)
          fd.append('chassisNumber', formData.chassisNumber);
        if (formData.otherFeatures)
          fd.append('otherFeatures', formData.otherFeatures);
      }

      fd.append('condition', formData.condition);
      fd.append('priceListed', formData.priceListed);
      fd.append('tradeMethod', formData.tradeMethod);
      fd.append('sellerConfirm', 'true');
      fd.append('commissionTermsAccepted', 'true');

      fd.append(
        'location',
        JSON.stringify({
          city: formData.city,
          district: formData.district,
          address: formData.address,
        })
      );

      formData.images.forEach((img) => {
        const uriParts = img.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        fd.append('photos', {
          uri: img.uri,
          type: `image/${fileType}`,
          name: `photo.${fileType}`,
        } as any);
      });

      const createResponse = await listingService.createListing(fd);
      listingId =
        createResponse?._id ||
        createResponse?.data?._id ||
        createResponse?.listing?._id ||
        '';

      if (!listingId) {
        Alert.alert(
          'Lỗi tạo tin đăng!',
          'Không nhận được ID tin đăng từ server. Vui lòng thử lại.'
        );
        return;
      }

      Alert.alert('Tạo tin đăng thành công!', 'Bạn muốn làm gì tiếp theo?', [
        {
          text: 'Về trang tài khoản',
          style: 'cancel',
          onPress: () => router.back(),
        },
        {
          text: 'Xem tin đăng',
          onPress: () => router.push(`/(tabs)/product/${listingId}`),
        },
        {
          text: 'Gửi duyệt ngay',
          onPress: async () => {
            try {
              await listingService.submitForReview(listingId);
              Alert.alert(
                'Thành công',
                'Tin đăng đã được gửi cho admin duyệt.'
              );
              router.back();
            } catch (error: any) {
              const msg =
                error?.response?.data?.message ||
                'Tin đã tạo nhưng gửi duyệt thất bại.';
              Alert.alert('Lỗi gửi duyệt!', msg);
              router.back();
            }
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!';
      Alert.alert('Thao tác thất bại!', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ======================= UI ======================= */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Thông tin cơ bản</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Loại sản phẩm *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    openPicker('type', [
                      { label: 'Chọn loại sản phẩm', value: '' },
                      { label: 'Ô tô điện', value: 'Car' },
                      { label: 'Pin xe điện', value: 'Battery' },
                    ])
                  }
                  disabled={!!editId}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !formData.type && styles.pickerButtonTextPlaceholder,
                      editId && styles.pickerButtonTextDisabled,
                    ]}
                  >
                    {formData.type === 'Car'
                      ? 'Ô tô điện'
                      : formData.type === 'Battery'
                      ? 'Pin xe điện'
                      : 'Chọn loại sản phẩm'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Hãng *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: VinFast, Toyota..."
                  value={formData.make}
                  onChangeText={(value) => handleInputChange('make', value)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: VF8, City..."
                  value={formData.model}
                  onChangeText={(value) => handleInputChange('model', value)}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Năm sản xuất *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2024"
                  value={formData.year}
                  onChangeText={(value) => handleInputChange('year', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Giá bán *</Text>
              <TextInput
                style={styles.input}
                placeholder="1200000000"
                value={formData.priceListed}
                onChangeText={(value) =>
                  handleInputChange('priceListed', value)
                }
                keyboardType="numeric"
              />
              <Text style={styles.hint}>Đơn vị: VNĐ</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Thông số kỹ thuật</Text>

            {formData.type === 'Car' && (
              <>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Số km đã chạy *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="15000"
                      value={formData.mileageKm}
                      onChangeText={(value) =>
                        handleInputChange('mileageKm', value)
                      }
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Loại xe</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Sedan / SUV..."
                      value={formData.vehicleType}
                      onChangeText={(value) =>
                        handleInputChange('vehicleType', value)
                      }
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Biển số</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="30G-12345"
                      value={formData.licensePlate}
                      onChangeText={(value) =>
                        handleInputChange('licensePlate', value)
                      }
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Dung tích xi lanh (cc)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1500"
                      value={formData.engineDisplacementCc}
                      onChangeText={(value) =>
                        handleInputChange('engineDisplacementCc', value)
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Màu sơn</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Đỏ / Trắng..."
                      value={formData.paintColor}
                      onChangeText={(value) =>
                        handleInputChange('paintColor', value)
                      }
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Số máy</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1NZ-123456"
                      value={formData.engineNumber}
                      onChangeText={(value) =>
                        handleInputChange('engineNumber', value)
                      }
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Số khung</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VN123456789"
                    value={formData.chassisNumber}
                    onChangeText={(value) =>
                      handleInputChange('chassisNumber', value)
                    }
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Đặc điểm khác</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Bản cao cấp, có sunroof..."
                    value={formData.otherFeatures}
                    onChangeText={(value) =>
                      handleInputChange('otherFeatures', value)
                    }
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </>
            )}

            {formData.type === 'Battery' && (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Dung lượng pin (kWh) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="60"
                    value={formData.batteryCapacityKWh}
                    onChangeText={(value) =>
                      handleInputChange('batteryCapacityKWh', value)
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Số chu kỳ sạc</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.chargeCycles}
                    onChangeText={(value) =>
                      handleInputChange('chargeCycles', value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Tình trạng *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    openPicker('condition', [
                      { label: 'Chọn tình trạng', value: '' },
                      { label: 'Mới', value: 'New' },
                      { label: 'Như mới', value: 'LikeNew' },
                      { label: 'Đã qua sử dụng', value: 'Used' },
                      { label: 'Cũ/nhiều hao mòn', value: 'Worn' },
                    ])
                  }
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !formData.condition && styles.pickerButtonTextPlaceholder,
                    ]}
                  >
                    {formData.condition === 'New'
                      ? 'Mới'
                      : formData.condition === 'LikeNew'
                      ? 'Như mới'
                      : formData.condition === 'Used'
                      ? 'Đã qua sử dụng'
                      : formData.condition === 'Worn'
                      ? 'Cũ/nhiều hao mòn'
                      : 'Chọn tình trạng'}
                  </Text>
                </TouchableOpacity>
              </View>

              {formData.type === 'Car' && (
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Dung lượng pin (kWh)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(Không bắt buộc)"
                    value={formData.batteryCapacityKWh}
                    onChangeText={(value) =>
                      handleInputChange('batteryCapacityKWh', value)
                    }
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Hình ảnh</Text>

            {editId && existingPhotos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  Ảnh hiện có ({existingPhotos.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imagesGrid}>
                    {existingPhotos.map((p, idx) => (
                      <View key={p.publicId || idx} style={styles.imageWrapper}>
                        <Image
                          source={{ uri: p.url }}
                          style={styles.uploadedImage}
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeExistingPhoto(p.publicId)}
                        >
                          <X color={COLORS.secondary.white} size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <Text style={styles.hint}>
                  *Bạn có thể xoá ảnh cũ bằng nút dấu X trên mỗi ảnh. Ảnh mới
                  tải lên sẽ được thêm vào danh sách.
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>
                Tải lên hình ảnh{' '}
                {editId ? '(Tối đa 10 ảnh mới)' : '(Tối đa 10 ảnh)'}{' '}
                {!editId && '*'}
              </Text>
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleImageUpload}
              >
                <Upload color={COLORS.primary[600]} size={32} />
                <Text style={styles.uploadText}>
                  {!editId
                    ? 'Cần tối thiểu 3 ảnh'
                    : 'Không bắt buộc thêm ảnh khi chỉnh sửa'}
                </Text>
                <Text style={styles.uploadButtonText}>Chọn ảnh</Text>
              </TouchableOpacity>
            </View>

            {imagePreviewUrls.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>
                  Ảnh mới sẽ thêm ({imagePreviewUrls.length}/10)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.imagesGrid}>
                    {imagePreviewUrls.map((url, index) => (
                      <View key={index} style={styles.imageWrapper}>
                        <Image
                          source={{ uri: url }}
                          style={styles.uploadedImage}
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(index)}
                        >
                          <X color={COLORS.secondary.white} size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Thông tin liên hệ</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Thành phố *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    openPicker('city', [
                      { label: 'Chọn thành phố', value: '' },
                      { label: 'Hà Nội', value: 'Hà Nội' },
                      { label: 'TP.HCM', value: 'TP.HCM' },
                      { label: 'Đà Nẵng', value: 'Đà Nẵng' },
                      { label: 'Cần Thơ', value: 'Cần Thơ' },
                      { label: 'Hải Phòng', value: 'Hải Phòng' },
                    ])
                  }
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !formData.city && styles.pickerButtonTextPlaceholder,
                    ]}
                  >
                    {formData.city || 'Chọn thành phố'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Quận/Huyện *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Cầu Giấy, Quận 1..."
                  value={formData.district}
                  onChangeText={(value) => handleInputChange('district', value)}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Địa chỉ chi tiết *</Text>
              <TextInput
                style={styles.input}
                placeholder="Số nhà, tên đường..."
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Phương thức giao dịch *</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() =>
                  openPicker('tradeMethod', [
                    { label: 'Gặp mặt trực tiếp', value: 'meet' },
                    { label: 'Gửi vận chuyển', value: 'ship' },
                    { label: 'Ký gửi', value: 'consignment' },
                  ])
                }
              >
                <Text
                  style={[
                    styles.pickerButtonText,
                    !formData.tradeMethod && styles.pickerButtonTextPlaceholder,
                  ]}
                >
                  {formData.tradeMethod === 'meet'
                    ? 'Gặp mặt trực tiếp'
                    : formData.tradeMethod === 'ship'
                    ? 'Gửi vận chuyển'
                    : formData.tradeMethod === 'consignment'
                    ? 'Ký gửi'
                    : 'Chọn phương thức'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Xem trước tin đăng</Text>
              <Text style={styles.previewText}>
                <Text style={styles.previewLabel}>Loại:</Text>{' '}
                {formData.type === 'Car'
                  ? 'Ô tô điện'
                  : formData.type === 'Battery'
                  ? 'Pin xe điện'
                  : 'Chưa chọn'}
              </Text>
              <Text style={styles.previewText}>
                <Text style={styles.previewLabel}>Giá:</Text>{' '}
                {formData.priceListed
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(formData.priceListed))
                  : 'Chưa nhập'}
              </Text>
              <Text style={styles.previewText}>
                <Text style={styles.previewLabel}>Hãng:</Text>{' '}
                {formData.make || 'Chưa nhập'} -{' '}
                <Text style={styles.previewLabel}>Model:</Text>{' '}
                {formData.model || 'Chưa nhập'}
              </Text>
              <Text style={styles.previewText}>
                <Text style={styles.previewLabel}>Năm:</Text>{' '}
                {formData.year || 'Chưa nhập'} -{' '}
                <Text style={styles.previewLabel}>Địa điểm:</Text>{' '}
                {formData.city || 'Chưa nhập'}
              </Text>
              <Text style={styles.previewText}>
                <Text style={styles.previewLabel}>Tình trạng:</Text>{' '}
                {formData.condition || 'Chưa chọn'}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoadingPrefill) {
    return (
      <View style={styles.container}>
        <Header title={editId ? 'Chỉnh sửa tin' : 'Đăng tin'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[600]} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={editId ? 'Chỉnh sửa tin' : 'Đăng tin'} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((step) => (
              <View key={step} style={styles.progressItem}>
                <View
                  style={[
                    styles.progressCircle,
                    step <= currentStep && styles.progressCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressNumber,
                      step <= currentStep && styles.progressNumberActive,
                    ]}
                  >
                    {step}
                  </Text>
                </View>
                {step < 4 && (
                  <View
                    style={[
                      styles.progressLine,
                      step < currentStep && styles.progressLineActive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Thông tin cơ bản</Text>
            <Text style={styles.progressLabel}>Chi tiết kỹ thuật</Text>
            <Text style={styles.progressLabel}>Hình ảnh</Text>
            <Text style={styles.progressLabel}>Liên hệ</Text>
          </View>
        </View>

        {/* Form Content */}
        {renderStep()}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentStep === 1 && styles.navButtonDisabled,
            ]}
            onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft
              size={20}
              color={currentStep === 1 ? COLORS.gray[400] : COLORS.gray[700]}
            />
            <Text
              style={[
                styles.navButtonText,
                currentStep === 1 && styles.navButtonTextDisabled,
              ]}
            >
              Quay lại
            </Text>
          </TouchableOpacity>

          {currentStep === 4 ? (
            <Button
              title={
                isSubmitting
                  ? editId
                    ? 'Đang lưu...'
                    : 'Đang đăng...'
                  : editId
                  ? 'Lưu thay đổi'
                  : 'Đăng tin'
              }
              onPress={handleSubmit}
              loading={isSubmitting}
            />
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>Tiếp tục</Text>
              <ChevronRight size={20} color={COLORS.secondary.white} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.modalClose}>Đóng</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {pickerOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => selectPickerValue(option.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      option.value === '' && styles.modalOptionTextPlaceholder,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary[600],
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray[600],
  },
  progressNumberActive: {
    color: COLORS.secondary.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary[600],
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.gray[600],
    flex: 1,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    color: COLORS.gray[900],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  pickerButton: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.gray[900],
  },
  pickerButtonTextPlaceholder: {
    color: COLORS.gray[400],
  },
  pickerButtonTextDisabled: {
    color: COLORS.gray[400],
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
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[900],
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.gray[900],
  },
  modalOptionTextPlaceholder: {
    color: COLORS.gray[400],
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[300],
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray[50],
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
  previewBox: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray[900],
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 4,
  },
  previewLabel: {
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray[200],
  },
  navButtonDisabled: {
    backgroundColor: COLORS.gray[100],
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginLeft: 8,
  },
  navButtonTextDisabled: {
    color: COLORS.gray[400],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.white,
    marginRight: 8,
  },
});
