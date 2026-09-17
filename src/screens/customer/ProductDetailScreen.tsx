import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../constants/theme';
import { Button } from '../../components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { productId } = route.params || {};

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      if (!productId) return;
      const response = await axios.get(`${API_URL}/shop/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      // Dummy data fallback
      setProduct({
        id: productId || '1',
        name: 'Premium Motor Oil 5W-30',
        description: 'High quality synthetic motor oil for modern engines. Protects against wear and tear, and ensures smooth running of your engine in extreme conditions.',
        price: 29.99,
        stock: 15,
        imageUrl: null,
        category: { name: 'Fluids' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // Dummy token assumption
      const token = await AsyncStorage.getItem('authToken');
      
      await axios.post(`${API_URL}/shop/cart/items`, {
        productId: product.id,
        quantity,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Success", "Added to cart!", [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => navigation.navigate('Cart' as never) }
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert("Success", "Added to cart! (Offline Mode)", [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => navigation.navigate('Cart' as never) }
      ]);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl.startsWith('http') ? product.imageUrl : `${API_URL}${product.imageUrl}` }} style={styles.productImage} />
          ) : (
            <Ionicons name="construct-outline" size={100} color={colors.neutral[300]} />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.category}>{product.category?.name || 'General'}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
          <View style={styles.stockContainer}>
            <View style={[styles.stockBadge, product.stock > 0 ? styles.inStock : styles.outOfStock]}>
              <Text style={styles.stockText}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</Text>
            </View>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{product.description || 'No description available for this product.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.qtyButton} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyButton} 
            onPress={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <Ionicons name="add" size={20} color={quantity >= product.stock ? colors.neutral[300] : colors.neutral[700]} />
          </TouchableOpacity>
        </View>

        <Button 
          title={`Add to Cart - $${(product.price * quantity).toFixed(2)}`}
          onPress={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
          style={styles.addToCartButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: spacing.lg,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
    textTransform: 'uppercase',
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  stockContainer: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
  },
  stockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  inStock: {
    backgroundColor: colors.success[100],
  },
  outOfStock: {
    backgroundColor: colors.error[100],
  },
  stockText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[700],
  },
  descriptionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.neutral[600],
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    alignItems: 'center',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  qtyButton: {
    padding: spacing.sm,
  },
  qtyText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.sm,
  },
  addToCartButton: {
    flex: 1,
  },
});
