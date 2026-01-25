import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

/* ================= TYPES ================= */

interface InputPropsType {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

/* ================= INPUT ================= */

export const Input: React.FC<InputPropsType> = ({
  placeholder,
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

/* ================= DATE INPUT ================= */

export const InputDate = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: Date;
  onChange: (date: Date) => void;
}) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>

      <Pressable style={styles.input} onPress={() => setShow(true)}>
        <Text style={{ color: value ? "#111827" : "#9CA3AF" }}>
          {value ? value.toDateString() : placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShow(false);
            if (date) onChange(date);
          }}
        />
      )}
    </View>
  );
};

/* ================= TIME INPUT ================= */

export const InputTime = ({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: Date;
  onChange: (date: Date) => void;
}) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>

      <Pressable style={styles.input} onPress={() => setShow(true)}>
        <Text style={{ color: value ? "#111827" : "#9CA3AF" }}>
          {value
            ? value.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="time"
          display="default"
          onChange={(_, date) => {
            setShow(false);
            if (date) onChange(date);
          }}
        />
      )}
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    marginBottom: 16, // space-y-4
  },

  label: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280", // text-gray-500
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 1,
  },

  input: {
    width: "100%",
    padding: 12, // p-3
    backgroundColor: "#F9FAFB", // bg-gray-50
    borderRadius: 12, // rounded-xl
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
});
