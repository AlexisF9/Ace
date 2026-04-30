import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

type Variant =
  | "primary"
  | "secondary"
  | "outline-orange"
  | "ghost"
  | "dark"
  | "outline-white";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string; spinnerColor: string }> = {
  primary: {
    container: "bg-orange active:opacity-70",
    text: "text-white",
    spinnerColor: "#FFFFFF",
  },
  secondary: {
    container: "bg-orange active:opacity-70",
    text: "text-white",
    spinnerColor: "#FFFFFF",
  },
  "outline-orange": {
    container: "bg-transparent border border-orange active:opacity-70",
    text: "text-orange",
    spinnerColor: "#C4501A",
  },
  ghost: {
    container: "bg-surface border border-ink-border active:opacity-70",
    text: "text-ink",
    spinnerColor: "#0C0C0C",
  },
  dark: {
    container: "bg-ink active:opacity-70",
    text: "text-white",
    spinnerColor: "#FFFFFF",
  },
  "outline-white": {
    container: "bg-transparent border border-white active:opacity-70",
    text: "text-white",
    spinnerColor: "#FFFFFF",
  },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${styles.container}
        ${fullWidth ? "w-full" : "self-start px-5"}
        py-3.5 rounded-md items-center justify-center
        ${isDisabled ? "opacity-40" : ""}
      `}
    >
      {loading ? (
        <ActivityIndicator color={styles.spinnerColor} size="small" />
      ) : (
        <Text className={`font-display text-sm ${styles.text}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
