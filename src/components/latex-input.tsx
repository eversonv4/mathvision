import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MathView } from '@/components/math-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface LatexInputProps {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  editable?: boolean;
}

/** Campo de texto para LaTeX com pré-visualização tipografada ao vivo. */
export function LatexInput({ value, onChangeText, placeholder, editable = true }: LatexInputProps) {
  const theme = useTheme();
  const [preview, setPreview] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setPreview(value), 250);
    return () => clearTimeout(id);
  }, [value]);

  return (
    <View style={styles.container}>
      <ThemedView type="background" style={styles.previewBox}>
        {preview.trim() ? (
          <MathView latex={preview} fontSize={20} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            A pré-visualização aparece aqui
          </ThemedText>
        )}
      </ThemedView>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        editable={editable}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundSelected, borderColor: theme.border },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  previewBox: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    padding: Spacing.three,
    fontFamily: Fonts.mono,
    fontSize: 15,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
