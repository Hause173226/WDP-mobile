import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug helper để kiểm tra token trong AsyncStorage
 */
export const debugToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const user = await AsyncStorage.getItem('user');

    console.log('=== DEBUG TOKEN ===');
    console.log('AccessToken:', accessToken ? 'EXISTS' : 'MISSING');
    console.log('RefreshToken:', refreshToken ? 'EXISTS' : 'MISSING');
    console.log('User:', user ? JSON.parse(user) : 'MISSING');
    console.log('==================');

    return {
      accessToken,
      refreshToken,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.error('Error debugging token:', error);
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = async () => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  console.log('✅ Cleared all auth data');
};
