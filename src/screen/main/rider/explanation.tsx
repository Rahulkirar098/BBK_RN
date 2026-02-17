import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Check,
  Zap,
  Users,
  Anchor,
  ArrowLeft,
  PlusCircle,
  Share2,
  Lock,
} from 'lucide-react-native';

import {
  colors,
  horizontalScale,
  typography,
  verticalScale,
} from '../../../theme';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StepCard, BenefitItem } from '../../../components/molicules';
import { useNavigation } from '@react-navigation/native';

const ExplanationView: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How BookBySeat Works</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Premium Watersports.{'\n'}Shared Prices.
          </Text>
          <Text style={styles.heroSubtitle}>
            We fill empty seats on boat charters so you pay a fraction of the
            cost.
          </Text>
        </View>

        {/* Steps */}
        <Text style={styles.sectionTitle}>How to Join</Text>

        <StepCard
          badgeStyle={{ backgroundColor: colors.primary }}
          number="1"
          title="Find or Request"
          description="Browse existing trips or request a trip for your preferred time. We'll notify operators to pick it up."
          icon={
            <PlusCircle size={horizontalScale(36)} color={colors.gray200} />
          }
        />

        <StepCard
          badgeStyle={{ backgroundColor: colors.orange500 }}
          number="2"
          title="Lock Your Seat"
          description="Book your spot. Your card is pre-authorized (held), not charged, until the trip is confirmed."
          icon={<Lock size={horizontalScale(36)} color={colors.gray200} />}
        />

        <StepCard
          badgeStyle={{ backgroundColor: colors.blue600 }}
          number="3"
          title="Confirmed & Go"
          description="Once the minimum riders join, the trip confirms. You receive a calendar invite and WhatsApp group link."
          icon={<Check size={horizontalScale(36)} color={colors.gray200} />}
        />

        {/* Benefits */}
        <Text style={styles.sectionTitle}>Why BookBySeat?</Text>

        <View style={styles.benefitsWrapper}>
          <BenefitItem
            icon={<Zap size={18} color={colors.primary} />}
            title="Instant Access"
            text="Real-time availability. No waiting for replies."
          />
          <BenefitItem
            icon={<Users size={18} color={colors.blue600} />}
            title="Social Vibe"
            text="Meet other wakeboarders and anglers."
          />
          <BenefitItem
            icon={<Share2 size={18} color={colors.orange500} />}
            title="Crowdsourcing"
            text="Create a request and let others join."
          />
          <BenefitItem
            icon={<Anchor size={18} color={colors.gray900} />}
            title="Verified Fleet"
            text="All operators are licensed and verified."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExplanationView;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  backButton: {
    marginRight: 12,
  },

  headerTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  hero: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 20,
    marginBottom: 28,
  },

  heroTitle: {
    ...typography.screenTitle,
    color: colors.white,
    marginBottom: 8,
  },

  heroSubtitle: {
    ...typography.body,
    color: colors.primaryLight,
  },

  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    marginVertical: verticalScale(10),
  },

  benefitsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  benefitCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  benefitTitle: {
    ...typography.cardTitle,
    marginTop: 6,
    marginBottom: 4,
    color: colors.textPrimary,
  },

  benefitText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
