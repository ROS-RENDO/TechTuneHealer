import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../constants/theme';
import { Button } from './Button';

interface CameraCaptureProps {
  onImageSelected: (uri: string) => void;
  isLoading?: boolean;
}

export function CameraCapture({ onImageSelected, isLoading }: CameraCaptureProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      onImageSelected(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          )}
          {!isLoading && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setImageUri(null)}>
              <Ionicons name="close-circle" size={28} color={colors.error[500]} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Ionicons name="camera-outline" size={48} color={colors.neutral[400]} />
          <Text style={styles.placeholderText}>Upload or take a photo of the issue</Text>
        </View>
      )}

      {!isLoading && (
        <View style={styles.buttonContainer}>
          <Button title="Gallery" onPress={pickImage} variant="outline" style={styles.actionButton} />
          <Button title="Take Photo" onPress={takePhoto} variant="primary" style={styles.actionButton} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  placeholderContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  placeholderText: {
    marginTop: spacing.sm,
    color: colors.neutral[500],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
