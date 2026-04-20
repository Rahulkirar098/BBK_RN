import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Star } from "lucide-react-native";

type RatingProps = {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
  color?: string;
  disabled?: boolean;
};

const MIN = 0;
const MAX = 5;

const labels = ["Very Bad", "Bad", "Ok-Ok", "Good", "Very Good"];

export const StarRating: React.FC<RatingProps> = ({
  rating,
  onChange,
  size = 24,
  color = "#FFD700",
  disabled = false,
}) => {
  const safeRating = Math.min(Math.max(rating, MIN), MAX);

  return (
    <View>
      {/* Stars */}
      <View style={styles.container}>
        {Array.from({ length: MAX }).map((_, index) => {
          const value = index + 1;
          const filled = value <= safeRating;

          return (
            <TouchableOpacity
              key={index}
              disabled={disabled}
              onPress={() => onChange(value)}
              style={styles.starWrapper}
              activeOpacity={0.7}
            >
              <Star
                size={size}
                color={color}
                fill={filled ? color : "none"}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Labels */}
      <View style={styles.labelRow}>
        {labels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.label,
              safeRating === index + 1 && styles.activeLabel,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  starWrapper: {
    flex: 1,
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    color: "#6B7280",
  },
  activeLabel: {
    color: "#111827",
    fontWeight: "600",
  },
});