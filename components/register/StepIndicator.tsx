import { View, Text } from "react-native";

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i + 1 === current;
        const isDone = i + 1 < current;
        return (
          <View
            key={i}
            className={`h-1 rounded-pill flex-1 ${
              isActive || isDone ? "bg-orange" : "bg-ink-border"
            }`}
          />
        );
      })}
      <Text className="font-body text-xs text-ink-tertiary ml-1">
        {current}/{total}
      </Text>
    </View>
  );
}
