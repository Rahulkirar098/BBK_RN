import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';

import { Star, Bell, Zap, Calendar, MapPin } from 'lucide-react-native';

import { colors, typography } from '../../theme';

interface Props {
  session: any;
  labels: {
    waitlist: string;
    book: string;
  };
  onPress: () => void;
}

export const SessionCardRider = ({ session, labels, onPress }: Props) => {
  const isFull = session.bookedSeats >= session.totalSeats;
  const isConfirmed = session.bookedSeats >= session.minRidersToConfirm;
  const isRequested = session.isRequested;

  const statusLabel = () => {
    if (isRequested) return 'Requested';
    if (isFull) return 'Waitlist Only';
    if (isConfirmed) return 'Confirmed';
    return `Needs ${session.minRidersToConfirm - session.bookedSeats} more`;
  };

  const statusContainerStyle = [
    styles.statusBadge,
    isRequested
      ? styles.requestedBadge
      : isFull
      ? styles.fullBadge
      : isConfirmed
      ? styles.confirmedBadge
      : styles.neutralBadge,
  ];

  const statusTextStyle = [
    styles.statusText,
    isRequested || isFull || isConfirmed ? styles.whiteText : styles.grayText,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        isRequested && styles.dashedBorder,
        isConfirmed && styles.confirmedBorder,
        isFull && styles.fullBorder,
      ]}
    >
      {/* IMAGE SECTION */}
      <View style={styles.imageWrapper}>
        <FastImage
          style={styles.image}
          source={{
            uri: session.image,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />

        <View style={styles.gradientOverlay} />

        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Star size={12} color={colors.primary} />
          <Text style={styles.ratingText}>
            {session?.captain?.rating || 'New'}
          </Text>
        </View>

        {/* Status */}
        <View style={statusContainerStyle}>
          {isFull && <Bell size={12} color={colors.white} />}
          {isConfirmed && <Zap size={12} color={colors.white} />}
          <Text style={statusTextStyle}>{statusLabel()}</Text>
        </View>

        {/* Title */}
        <View style={styles.imageBottom}>
          <Text style={styles.title}>{session.title}</Text>
          <Text style={styles.operator}>{session.operatorName}</Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={colors.primary} />
            <Text style={styles.metaText}>
              {session.timeStart.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.primary} />
            <Text numberOfLines={1} style={styles.metaText}>
              {session.location}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            {session.originalPrice && (
              <Text style={styles.originalPrice}>
                AED {session.originalPrice}
              </Text>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {session.currency} {session.pricePerSeat}
              </Text>
              <Text style={styles.perSeat}>/ seat</Text>
            </View>
          </View>

          {/* Action Button */}
          {isFull ? (
            <TouchableOpacity style={styles.waitlistBtn}>
              <Text style={styles.waitlistText}>{labels.waitlist}</Text>
            </TouchableOpacity>
          ) : isRequested ? (
            <TouchableOpacity style={styles.requestBtn}>
              <Text style={styles.requestText}>Join Request</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.bookBtn} onPress={onPress}>
              <Text style={styles.bookText}>{labels.book}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },

  dashedBorder: {
    borderStyle: 'dashed',
  },

  confirmedBorder: {
    borderColor: colors.primary,
  },

  fullBorder: {
    borderColor: colors.orange500,
  },

  imageWrapper: {
    height: 160,
    backgroundColor: colors.gray200,
  },

  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  ratingText: {
    ...typography.boldSmall,
    color: colors.textPrimary,
    marginLeft: 4,
  },

  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  requestedBadge: {
    backgroundColor: colors.gray900,
  },

  confirmedBadge: {
    backgroundColor: colors.primary,
  },

  fullBadge: {
    backgroundColor: colors.orange500,
  },

  neutralBadge: {
    backgroundColor: colors.gray100,
  },

  statusText: {
    ...typography.caption,
    marginLeft: 4,
  },

  whiteText: {
    color: colors.white,
  },

  grayText: {
    color: colors.gray900,
  },

  imageBottom: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },

  title: {
    ...typography.sectionTitle,
    color: colors.white,
  },

  operator: {
    ...typography.small,
    color: colors.gray200,
  },

  body: {
    padding: 16,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: 6,
    maxWidth: 120,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: 10,
  },

  originalPrice: {
    ...typography.small,
    color: colors.gray400,
    textDecorationLine: 'line-through',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  price: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },

  perSeat: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },

  waitlistBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  waitlistText: {
    ...typography.boldSmall,
    color: colors.orange500,
  },

  requestBtn: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  requestText: {
    ...typography.boldSmall,
    color: colors.gray500,
  },

  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  bookText: {
    ...typography.boldSmall,
    color: colors.white,
  },
});
