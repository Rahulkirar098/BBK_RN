import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity
} from "react-native";

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  primary?: boolean;
}

export const Stat: React.FC<StatProps> = ({ icon, label, value, primary }) => {
  return (
    <View style={statStyles.card}>
      <View style={statStyles.header}>
        {icon}
        <Text
          style={[
            statStyles.label,
            primary && { color: "#2563eb" },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          statStyles.value,
          primary && { color: "#2563eb" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const statStyles = StyleSheet.create({
  card: {
    width: (Dimensions.get("window").width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
});

import {
  CheckCircle2,
  AlertCircle,
  Edit2,
  Copy,
} from "lucide-react-native";

interface SessionCardProps {
  title: string;
  time: string;
  durationHours: number;
  bookedSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  confirmed: boolean;
  fillPercent: number;
  onEdit?: () => void;
  onCopy?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  title,
  time,
  durationHours,
  bookedSeats,
  totalSeats,
  pricePerSeat,
  confirmed,
  fillPercent,
  onEdit,
  onCopy,
}) => {
  return (
    <View style={styles.card}>
      {/* LEFT CONTENT */}
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.timeBadge}>{time}</Text>
              <Text style={styles.duration}>{durationHours} Hours</Text>
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.statusWrapper}>
            <View
              style={[
                styles.statusBadge,
                confirmed ? styles.confirmed : styles.filling,
              ]}
            >
              {confirmed ? (
                <CheckCircle2 size={12} color="#16a34a" />
              ) : (
                <AlertCircle size={12} color="#f97316" />
              )}
              <Text
                style={[
                  styles.statusText,
                  confirmed
                    ? styles.confirmedText
                    : styles.fillingText,
                ]}
              >
                {confirmed ? "Confirmed" : "Filling..."}
              </Text>
            </View>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <Text style={styles.seatsText}>
            {bookedSeats} / {totalSeats} Seats
          </Text>
          <Text style={styles.revenueText}>
            Revenue: AED {bookedSeats * pricePerSeat}
          </Text>
        </View>

        {/* PROGRESS */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPercent}%`,
                backgroundColor: confirmed ? "#22c55e" : "#f97316",
              },
            ]}
          />
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          style={styles.actionBtn}
        >
          <Edit2 size={18} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCopy}
          activeOpacity={0.8}
          style={styles.actionBtn}
        >
          <Copy size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginVertical: 12,
    flexDirection: "column",
    gap: 16,
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },

  timeBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12,
    color: "#111827",
  },

  duration: {
    fontSize: 14,
    color: "#6b7280",
  },

  statusWrapper: {
    alignItems: "flex-end",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  confirmed: {
    backgroundColor: "#dcfce7",
  },

  filling: {
    backgroundColor: "#fff7ed",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  confirmedText: {
    color: "#16a34a",
  },

  fillingText: {
    color: "#f97316",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  seatsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
  },

  revenueText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },

  progressBar: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
