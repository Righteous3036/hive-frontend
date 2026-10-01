import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { Radii, Spacing } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  onTrailingIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function InputField({
  label,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const { theme, fontSizes } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text, fontSize: fontSizes.sm }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.inputBg,
            borderColor: error
              ? theme.error
              : isFocused
              ? theme.primary
              : theme.border,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}
      >
        {leadingIcon && (
          <Ionicons
            name={leadingIcon}
            size={20}
            color={isFocused ? theme.primary : theme.textSecondary}
            style={styles.leadingIcon}
          />
        )}

        <TextInput
          {...props}
          placeholderTextColor={theme.textTertiary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: fontSizes.md,
            },
            style,
          ]}
        />

        {trailingIcon && (
          <TouchableOpacity
            onPress={onTrailingIconPress}
            disabled={!onTrailingIconPress}
            style={styles.trailingIcon}
          >
            <Ionicons
              name={trailingIcon}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.error, { color: theme.error, fontSize: fontSizes.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontWeight: '600',
    marginBottom: Spacing.xs + 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  leadingIcon: {
    marginRight: Spacing.sm,
  },
  trailingIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
  },
  error: {
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
});
