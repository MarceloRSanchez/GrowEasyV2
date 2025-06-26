import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Crown,
  Check,
  Camera,
  Users,
  Cloud,
  Zap,
  Gift,
  ShoppingCart,
} from 'lucide-react-native';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'seeds' | 'tools' | 'accessories';
  inStock: boolean;
}

interface ProFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const proFeatures: ProFeature[] = [
  {
    icon: <Camera size={24} color={Colors.primary} />,
    title: 'Advanced AI Diagnosis',
    description: 'Unlimited plant health scans with detailed treatment plans',
  },
  {
    icon: <Users size={24} color={Colors.primary} />,
    title: 'Expert Community Access',
    description: 'Direct chat with certified horticulturists and master gardeners',
  },
  {
    icon: <Cloud size={24} color={Colors.primary} />,
    title: 'Cloud Plant Library',
    description: 'Unlimited plant profiles with detailed care histories',
  },
  {
    icon: <Zap size={24} color={Colors.primary} />,
    title: 'Smart Automation',
    description: 'IoT device integration and automated care scheduling',
  },
];

const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Organic Herb Seed Kit',
    description: 'Basil, Mint, Rosemary, and Thyme seeds with starter pots',
    price: 24.99,
    originalPrice: 34.99,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'seeds',
    inStock: true,
  },
  {
    id: '2',
    name: 'Smart Plant Monitor',
    description: 'Wi-Fi enabled sensor for soil moisture, light, and temperature',
    price: 89.99,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'tools',
    inStock: true,
  },
  {
    id: '3',
    name: 'Self-Watering Planters',
    description: 'Set of 3 modern planters with built-in water reservoir',
    price: 45.99,
    originalPrice: 59.99,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'accessories',
    inStock: false,
  },
  {
    id: '4',
    name: 'Premium Growing Kit',
    description: 'Complete starter kit with LED grow light and nutrients',
    price: 129.99,
    image: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'tools',
    inStock: true,
  },
];

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<'pro' | 'shop'>('pro');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Shop & Pro</Text>
          <Text style={styles.subtitle}>Upgrade your gardening experience</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pro' && styles.activeTab]}
            onPress={() => setActiveTab('pro')}
          >
            <Crown size={20} color={activeTab === 'pro' ? Colors.white : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'pro' && styles.activeTabText]}>
              GrowEasy Pro
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shop' && styles.activeTab]}
            onPress={() => setActiveTab('shop')}
          >
            <ShoppingCart size={20} color={activeTab === 'shop' ? Colors.white : Colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'shop' && styles.activeTabText]}>
              Shop
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'pro' ? (
          /* Pro Section */
          <View style={styles.content}>
            {/* Pro Hero */}
            <Card style={styles.proHero}>
              <View style={styles.proHeader}>
                <Crown size={32} color={Colors.primary} />
                <Text style={styles.proTitle}>GrowEasy Pro</Text>
              </View>
              <Text style={styles.proSubtitle}>
                Unlock the full potential of your urban garden
              </Text>
              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>$12.99/month</Text>
                <Text style={styles.proPrice}>$7.99/month</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>40% OFF</Text>
                </View>
              </View>
              <Button
                title="Start Free Trial"
                onPress={() => {}}
                size="large"
                style={styles.proButton}
              />
              <Text style={styles.trialText}>7 days free, then $7.99/month</Text>
            </Card>

            {/* Pro Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Premium Features</Text>
              {proFeatures.map((feature, index) => (
                <Card key={index} style={styles.featureCard}>
                  <View style={styles.featureContent}>
                    <View style={styles.featureIcon}>
                      {feature.icon}
                    </View>
                    <View style={styles.featureInfo}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <Check size={20} color={Colors.success} />
                  </View>
                </Card>
              ))}
            </View>

            {/* Testimonials */}
            <Card style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>
                "GrowEasy Pro helped me turn my tiny balcony into a thriving garden. The AI diagnosis saved my tomatoes!"
              </Text>
              <View style={styles.testimonialAuthor}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                  style={styles.testimonialAvatar}
                />
                <View>
                  <Text style={styles.testimonialName}>Sarah Green</Text>
                  <Text style={styles.testimonialTitle}>Urban Gardener</Text>
                </View>
              </View>
            </Card>
          </View>
        ) : (
          /* Shop Section */
          <View style={styles.content}>
            {/* Special Offer */}
            <Card style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Gift size={24} color={Colors.warning} />
                <Text style={styles.offerTitle}>Limited Time Offer</Text>
              </View>
              <Text style={styles.offerText}>
                Free shipping on orders over $50. Use code: GROW2024
              </Text>
            </Card>

            {/* Shop Items */}
            <View style={styles.shopGrid}>
              {mockShopItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.shopItem}>
                  <Card style={styles.itemCard}>
                    <View style={styles.itemImageContainer}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      {!item.inStock && (
                        <View style={styles.outOfStockOverlay}>
                          <Text style={styles.outOfStockText}>Out of Stock</Text>
                        </View>
                      )}
                      {item.originalPrice && (
                        <View style={styles.saleBadge}>
                          <Text style={styles.saleBadgeText}>SALE</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View style={styles.priceRow}>
                        {item.originalPrice && (
                          <Text style={styles.itemOriginalPrice}>${item.originalPrice}</Text>
                        )}
                        <Text style={styles.itemPrice}>${item.price}</Text>
                      </View>
                      <Button
                        title={item.inStock ? 'Add to Cart' : 'Notify Me'}
                        onPress={() => {}}
                        variant={item.inStock ? 'primary' : 'outline'}
                        disabled={!item.inStock}
                        size="small"
                        style={styles.addToCartButton}
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  proHero: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: 'linear-gradient(135deg, #32E177 0%, #3DB5FF 100%)',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  proTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  proSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  originalPrice: {
    ...Typography.body,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  proPrice: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  proButton: {
    width: '100%',
    marginBottom: Spacing.sm,
  },
  trialText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featureCard: {
    marginBottom: Spacing.sm,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  testimonialCard: {
    backgroundColor: Colors.bgLight,
    marginBottom: Spacing.lg,
  },
  testimonialText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  testimonialName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  testimonialTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  offerCard: {
    backgroundColor: '#FFF9E6',
    marginBottom: Spacing.lg,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  offerTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  offerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  shopItem: {
    width: '48%',
  },
  itemCard: {
    padding: 0,
    overflow: 'hidden',
  },
  itemImageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  saleBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  saleBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  itemInfo: {
    padding: Spacing.md,
  },
  itemName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  itemOriginalPrice: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  addToCartButton: {
    width: '100%',
  },
});