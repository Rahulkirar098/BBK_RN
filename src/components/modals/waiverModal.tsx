import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  ShieldCheck,
  X,
  Check,
  ChevronDown,
  PenTool,
} from 'lucide-react-native';

import {
  colors,
  typography,
  horizontalScale,
  verticalScale,
} from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export const WaiverModal = ({ visible, onClose, onConfirm }: Props) => {
  const [signature, setSignature] = useState('');
  const [hasScrolled, setHasScrolled] = useState(false);

  const [checks, setChecks] = useState({
    risks: false,
    medical: false,
    liability: false,
    photos: false,
  });

  const allChecked = Object.values(checks).every(Boolean);
  const isReady = allChecked && signature.length > 2 && hasScrolled;

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      setHasScrolled(true);
    }
  };

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Liability Waiver</Text>
                <Text style={styles.subtitle}>Digital Agreement</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose}>
              <X size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          {/* SCROLLABLE CONTENT */}
          <ScrollView
            style={styles.scroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.documentBox}>
              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>1. Activity & Risks</Text>
                <Text style={styles.paragraph}>
                  I ("PARTICIPANT") Wakeboarding, wakesurfing and sport fishing
                  involve inherent risks including drowning, collision and
                  equipment failure.
                </Text>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>2. Medical Fitness</Text>
                <Text style={styles.paragraph}>
                  I certify that I am physically fit and have no medical
                  condition that would prevent full participation. I agree to
                  wear a USCG-approved life vest at all times while in the
                  water.
                </Text>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>3. Release of Liability</Text>
                <Text style={styles.paragraph}>
                  I hereby release and hold harmless BookBySeat, the Operator,
                  the Captain, and their affiliates from any liability, claims,
                  or demands for personal injury, death, or property damage
                  arising from my participation.
                </Text>
              </View>

              <View style={styles.documentSection}>
                <Text style={styles.sectionTitle}>4. Media Release</Text>
                <Text style={styles.paragraph}>
                  I grant BookBySeat permission to use photographs or video
                  recordings of me for marketing purposes without compensation.
                </Text>
              </View>
              <View style={styles.documentFooter}>
                <Text style={styles.documentFooterText}>
                  Document ID: BBS-{Date.now().toString().slice(-6)}
                </Text>
                <Text style={styles.documentFooterText}>Page 1 of 1</Text>
              </View>
            </View>

            {!hasScrolled && (
              <View style={styles.scrollHint}>
                <ChevronDown size={16} color={colors.primary} />
                <Text style={styles.scrollHintText}>
                  Scroll to bottom to continue
                </Text>
              </View>
            )}

            {/* CHECKBOXES */}
            <View
              style={[
                styles.checkboxContainer,
                !hasScrolled && { opacity: 0.5 },
              ]}
              pointerEvents={hasScrolled ? 'auto' : 'none'}
            >
              <Text style={styles.acknowledgeTitle}>ACKNOWLEDGE TERMS</Text>

              {[
                { key: 'risks', label: 'I accept the risks involved.' },
                { key: 'medical', label: 'I am medically fit.' },
                { key: 'liability', label: 'I release liability.' },
                { key: 'photos', label: 'I consent to media usage.' },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.checkboxRow}
                  onPress={() => toggleCheck(item.key as keyof typeof checks)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checks[item.key as keyof typeof checks] &&
                        styles.checkboxActive,
                    ]}
                  >
                    {checks[item.key as keyof typeof checks] && (
                      <Check size={14} color={colors.white} />
                    )}
                  </View>

                  <Text style={styles.checkboxLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* SIGNATURE AREA */}
          <View style={styles.footer}>
            <View style={styles.signatureLabelRow}>
              <Text style={styles.signatureLabel}>Digital Signature</Text>

              <Text style={styles.signatureDate}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.signatureInputWrapper}>
              <PenTool size={18} color={colors.gray400} />
              <TextInput
                placeholder="Type full legal name"
                placeholderTextColor={colors.gray400}
                value={signature}
                onChangeText={setSignature}
                style={styles.signatureInput}
              />
            </View>

            <TouchableOpacity
              disabled={!isReady}
              onPress={() => onConfirm({ signature, checks, hasScrolled })}
              style={[styles.confirmButton, !isReady && { opacity: 0.5 }]}
            >
              <Text style={styles.confirmText}>
                {hasScrolled ? 'Confirm Signature' : 'Read to Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: horizontalScale(20),
  },

  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
  },

  header: {
    padding: horizontalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(10),
  },

  iconBox: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 10,
  },

  title: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  scroll: {
    paddingHorizontal: horizontalScale(20),
  },

  documentBox: {
    backgroundColor: colors.gray100,
    padding: horizontalScale(16),
    borderRadius: horizontalScale(14),
    marginVertical: verticalScale(10),
  },

  documentSection: {
    marginBottom: verticalScale(10),
    borderBottomWidth: horizontalScale(1),
    borderColor: colors.gray400,
  },

  sectionTitle: {
    ...typography.boldSmall,
    color: colors.textPrimary,
    marginBottom: verticalScale(5),
  },

  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: verticalScale(5),
  },

  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  documentFooterText: {
    ...typography.caption,
    color: colors.gray400,
  },

  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: verticalScale(20),
  },

  scrollHintText: {
    ...typography.caption,
    color: colors.primary,
  },

  acknowledgeTitle: {
    ...typography.boldSmall,
    color: colors.gray500,
    marginVertical: verticalScale(10),
    letterSpacing: horizontalScale(1),
  },

  checkboxContainer: {
    marginBottom: verticalScale(30),
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },

  footer: {
    padding: horizontalScale(20),
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },

  signatureLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },

  signatureLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.gray400,
    ...typography.caption,
  },

  signatureDate: {
    color: colors.gray400,
    ...typography.caption,
  },

  signatureInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 14,
    paddingHorizontal: horizontalScale(12),
    marginBottom: verticalScale(20),
  },

  signatureInput: {
    flex: 1,
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(16),

    backgroundColor: colors.gray100,
    borderRadius: horizontalScale(12),

    ...typography.sectionTitle,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontWeight: '500',

    color: colors.textPrimary,
  },

  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: verticalScale(16),
    borderRadius: 14,
    alignItems: 'center',
  },

  confirmText: {
    ...typography.cardTitle,
    color: colors.white,
  },
});
