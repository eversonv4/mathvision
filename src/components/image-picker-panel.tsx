import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ImagemSelecionada } from '@/lib/api';

interface ImagePickerPanelProps {
  imagem: ImagemSelecionada | null;
  onChange: (imagem: ImagemSelecionada | null) => void;
  desabilitado?: boolean;
}

function resultadoParaImagem(resultado: ImagePicker.ImagePickerResult): ImagemSelecionada | null {
  if (resultado.canceled || resultado.assets.length === 0) return null;
  const ativo = resultado.assets[0];
  return { uri: ativo.uri, nome: ativo.fileName, tipoMime: ativo.mimeType };
}

export function ImagePickerPanel({ imagem, onChange, desabilitado }: ImagePickerPanelProps) {
  const theme = useTheme();

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) return;
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    const nova = resultadoParaImagem(resultado);
    if (nova) onChange(nova);
  }

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });
    const nova = resultadoParaImagem(resultado);
    if (nova) onChange(nova);
  }

  if (imagem) {
    return (
      <ThemedView type="backgroundElement" style={styles.previewContainer}>
        <Image source={{ uri: imagem.uri }} style={styles.preview} contentFit="contain" />
        <Pressable
          disabled={desabilitado}
          onPress={() => onChange(null)}
          style={({ pressed }) => [
            styles.botaoRemover,
            { backgroundColor: theme.background },
            pressed && styles.pressionado,
          ]}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={theme.text} />
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.row}>
      <Pressable
        disabled={desabilitado}
        onPress={tirarFoto}
        style={({ pressed }) => [
          styles.botao,
          { backgroundColor: theme.tint },
          pressed && styles.pressionado,
          desabilitado && styles.desabilitado,
        ]}>
        <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} size={18} tintColor={theme.tintText} />
        <ThemedText type="smallBold" themeColor="tintText">
          Tirar foto
        </ThemedText>
      </Pressable>

      <Pressable
        disabled={desabilitado}
        onPress={escolherDaGaleria}
        style={({ pressed }) => [
          styles.botao,
          styles.botaoSecundario,
          { borderColor: theme.border },
          pressed && styles.pressionado,
          desabilitado && styles.desabilitado,
        ]}>
        <SymbolView name={{ ios: 'photo.on.rectangle', android: 'image', web: 'image' }} size={18} tintColor={theme.text} />
        <ThemedText type="smallBold">Galeria</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  pressionado: {
    opacity: 0.75,
  },
  desabilitado: {
    opacity: 0.5,
  },
  previewContainer: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 220,
  },
  botaoRemover: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
