import { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useRegisterStore } from "../../../../stores/registerStore";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PlayerCredentialsScreen() {
  const router = useRouter();
  const { player, updatePlayer } = useRegisterStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState(player.email);
  const [password, setPassword] = useState(player.password);
  const [confirm, setConfirm] = useState(player.password);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = t("playerCredentials.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = t("playerCredentials.errors.emailInvalid");
    if (!password) e.password = t("playerCredentials.errors.passwordRequired");
    else if (password.length < 8) e.password = t("playerCredentials.errors.passwordMin");
    if (password !== confirm) e.confirm = t("playerCredentials.errors.passwordMismatch");
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    updatePlayer({ email: email.trim(), password });
    router.push("/(auth)/register/player/profile");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pt-14 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <StepIndicator current={1} total={4} />

        <Text className="font-display text-ink text-2xl mt-6 mb-1">
          {t("playerCredentials.title")}
        </Text>
        <Text className="font-body text-ink-tertiary text-sm mb-8">
          {t("playerCredentials.subtitle")}
        </Text>

        <View className="gap-4">
          <Input
            label={t("playerCredentials.email")}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="ton@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label={t("playerCredentials.password")}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder={t("playerCredentials.passwordPlaceholder")}
            secureTextEntry
          />
          <Input
            label={t("playerCredentials.confirm")}
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <View className="mt-8">
          <Button
            label={t("playerCredentials.next")}
            onPress={handleNext}
            disabled={!email || !password || !confirm}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
