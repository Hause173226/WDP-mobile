import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import { authAPI } from '@/services/authService';
import { useUserStore } from '@/store/userStore';

type AddressField = 'fullAddress' | 'ward' | 'district' | 'city' | 'province';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useUserStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    dateOfBirth: '',
    avatar: '',
    address: {
      fullAddress: '',
      ward: '',
      district: '',
      city: '',
      province: '',
    },
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTextChange =
    (field: keyof typeof formData) => (value: string) => {
      if (field === 'address') {
        return;
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleAddressChange = (field: AddressField) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const validateForm = useMemo(
    () => () => {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.phone ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return false;
      }

      if (formData.fullName.trim().length < 2) {
        Alert.alert('Lỗi', 'Họ tên phải có ít nhất 2 ký tự');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        Alert.alert('Lỗi', 'Email không hợp lệ');
        return false;
      }

      const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
        return false;
      }

      if (formData.password.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
        return false;
      }

      if (!agreeToTerms) {
        Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
        return false;
      }

      return true;
    },
    [formData, agreeToTerms]
  );

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signUp({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        avatar: formData.avatar || undefined,
        address: {
          fullAddress: formData.address.fullAddress || undefined,
          ward: formData.address.ward || undefined,
          district: formData.address.district || undefined,
          city: formData.address.city || undefined,
          province: formData.address.province || undefined,
        },
        termsAgreed: agreeToTerms,
      });

      const userId = response.user?._id || response._id || response.id;
      if (!userId) {
        throw new Error(
          'Không tìm thấy thông tin tài khoản trả về từ máy chủ.'
        );
      }

      if (response.accessToken) {
        await AsyncStorage.setItem('token', response.accessToken);
      }
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }

      await login({
        id: userId,
        email: response.user?.email || response.email || formData.email.trim(),
        name:
          response.user?.fullName ||
          response.fullName ||
          formData.fullName.trim(),
        role: response.user?.role || 'member',
        createdAt: response.user?.createdAt || new Date().toISOString(),
        avatar: response.user?.avatar || response.avatar || '',
        phone: response.user?.phone || formData.phone.trim(),
      });

      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      router.replace('/(tabs)');
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      Alert.alert('Đăng ký thất bại', apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[COLORS.primary[900], COLORS.primary[600]]}
          style={styles.header}
        >
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>
            Tham gia cộng đồng giao dịch EV hàng đầu Việt Nam
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Input
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChangeText={handleTextChange('fullName')}
          />

          <Input
            label="Email"
            placeholder="your@email.com"
            value={formData.email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={handleTextChange('email')}
          />

          <Input
            label="Số điện thoại"
            placeholder="0987654321"
            value={formData.phone}
            keyboardType="phone-pad"
            onChangeText={handleTextChange('phone')}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              {GENDERS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.genderOption,
                    formData.gender === item.value && styles.genderOptionActive,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, gender: item.value }))
                  }
                >
                  <Text
                    style={[
                      styles.genderText,
                      formData.gender === item.value && styles.genderTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Ngày sinh"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            onChangeText={handleTextChange('dateOfBirth')}
          />

          <Input
            label="Avatar URL (tùy chọn)"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatar}
            onChangeText={handleTextChange('avatar')}
          />

          <Input
            label="Địa chỉ"
            placeholder="123 Đường ABC"
            value={formData.address.fullAddress}
            onChangeText={handleAddressChange('fullAddress')}
          />

          <Input
            label="Phường/Xã"
            placeholder="Phường 1"
            value={formData.address.ward}
            onChangeText={handleAddressChange('ward')}
          />

          <Input
            label="Quận/Huyện"
            placeholder="Quận 1"
            value={formData.address.district}
            onChangeText={handleAddressChange('district')}
          />

          <Input
            label="Thành phố"
            placeholder="TP.HCM"
            value={formData.address.city}
            onChangeText={handleAddressChange('city')}
          />

          <Input
            label="Tỉnh/Thành"
            placeholder="Hồ Chí Minh"
            value={formData.address.province}
            onChangeText={handleAddressChange('province')}
          />

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={formData.password}
            secureTextEntry
            onChangeText={handleTextChange('password')}
          />

          <Input
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            value={formData.confirmPassword}
            secureTextEntry
            onChangeText={handleTextChange('confirmPassword')}
          />

          <TouchableOpacity
            onPress={() => setAgreeToTerms((prev) => !prev)}
            style={styles.termsContainer}
          >
            <View
              style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
            />
            <Text style={styles.termsText}>
              Tôi đồng ý với{' '}
              <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>

          <Button title="Đăng ký" onPress={handleRegister} loading={loading} />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type InputProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  containerStyle?: object;
};

function Input({ label, containerStyle, ...rest }: InputProps) {
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary.white,
    opacity: 0.9,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginVertical: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
  },
  genderOptionActive: {
    borderColor: COLORS.primary[600],
    backgroundColor: COLORS.primary[50],
  },
  genderText: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  genderTextActive: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  termsLink: {
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
});
