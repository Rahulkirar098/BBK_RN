import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Check } from "lucide-react-native";

interface CustomCheckboxProps {
  checked: boolean;
  label?: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  label,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxActive,
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && <Check size={14} color="#fff" />}
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxActive: {
    backgroundColor: "#0891B2",
    borderColor: "#0891B2",
  },
  checkboxDisabled: {
    backgroundColor: "#E5E7EB",
    borderColor: "#E5E7EB",
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    color: "#374151",
  },
});