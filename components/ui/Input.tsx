import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="font-display-semi text-ink-secondary text-xs mb-1.5">
          {label}
        </Text>
      )}
      <TextInput
        className={`
          bg-white border rounded-md px-4 py-3 font-body text-sm text-ink
          ${error ? "border-error" : "border-ink-border"}
        `}
        placeholderTextColor="#8A8A8A"
        {...props}
      />
      {error && (
        <Text className="font-body text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}
