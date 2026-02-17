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

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Trigger */}
      <Pressable style={styles.input} onPress={() => setVisible(true)}>
        <Text
          style={[
            styles.inputText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label || `Select ${label}`}
        </Text>
      </Pressable>

      {/* Dropdown Modal */}
      <Modal transparent visible={visible} animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    style={[
                      styles.option,
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
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
    flex: 1,
    marginBottom: verticalScale(5),
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: verticalScale(5),
    letterSpacing: 1,
  },

  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },

  inputText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  placeholderText: {
    color: "#9CA3AF",
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

  selectedOption: {
    backgroundColor: "#EEF2FF",
  },

  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },

  selectedText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
});
