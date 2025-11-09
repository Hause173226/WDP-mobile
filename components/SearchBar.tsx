import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  value?: string;
}

export default function SearchBar({
  placeholder = 'Tìm kiếm xe điện, pin...',
  onSearch,
  onFilterPress,
  value: externalValue,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = externalValue !== undefined ? externalValue : internalValue;

  const handleChangeText = (text: string) => {
    if (externalValue === undefined) {
      setInternalValue(text);
    }
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search color={COLORS.gray[400]} size={20} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          value={value}
          onChangeText={handleChangeText}
        />
      </View>
      {onFilterPress && (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
          <SlidersHorizontal color={COLORS.primary[600]} size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.secondary.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
