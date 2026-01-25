import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { verticalScale } from "../../theme";

/* ================= TYPES ================= */

interface SelectPropsType {
  label: string;
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange: (value: string) => void;
}

/* ================= SELECT ================= */

export const Select: React.FC<SelectPropsType> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ||
    `Select ${label}`;

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Trigger */}
      <Pressable style={styles.input} onPress={() => setVisible(true)}>
        <Text
          style={{
            color: value ? "#111827" : "#9CA3AF",
            fontWeight: "500",
          }}
        >
          {selectedLabel}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(5),
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280", // text-gray-500
    textTransform: "uppercase",
    marginBottom: verticalScale(5),
    letterSpacing: 1,
  },

  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#F9FAFB", // bg-gray-50
    borderRadius: 12, // rounded-xl
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: 300,
    overflow: "hidden",
  },

  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
});
