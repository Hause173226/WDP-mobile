import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/store/userStore';
import { authAPI } from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Gọi API signin từ BE mới
      const result = await authAPI.signIn({ email, password });

      console.log('✅ Login result:', result);

      // BE trả về accessToken, không phải token
      if (result?.user && result?.accessToken) {
        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('refreshToken', result.refreshToken);

        // Lưu user vào store
        await login({
          id: result.user._id || result.user.id || '',
          email: result.user.email || email,
          name: result.user.fullName || result.user.name || 'User',
          role: result.user.role || 'member',
          createdAt: result.user.createdAt || new Date().toISOString(),
        });

        Alert.alert('Thành công', 'Đăng nhập thành công!');
        router.replace('/(tabs)');
      } else {
        throw new Error('Sai tài khoản hoặc mật khẩu');
      }
    } catch (error: any) {
      console.log('❌ Login error:', error);
      Alert.alert(
        'Đăng nhập thất bại',
        error?.response?.data?.message ||
          error.message ||
          'Vui lòng kiểm tra lại thông tin'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[COLORS.primary[900], COLORS.primary[600]]}
          style={styles.header}
        >
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button title="Đăng nhập" onPress={handleLogin} loading={loading} />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary[600],
    fontSize: 14,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
});
