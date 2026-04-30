import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../hooks/useTranslation";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-ink text-2xl mb-8">
          {t("login.title")}
        </Text>

        {/* Formulaire */}
        <View className="gap-4 mb-6">
          <Input
            label={t("login.email")}
            value={email}
            onChangeText={setEmail}
            placeholder="ton@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label={t("login.password")}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {error && (
          <Text className="font-body text-xs text-error mb-4 text-center">
            {error}
          </Text>
        )}

        <Button
          label={t("login.submit")}
          onPress={handleLogin}
          loading={loading}
          disabled={!email || !password}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          className="mt-3 items-center"
        >
          <Text className="font-body text-ink-tertiary text-sm">
            {t("login.forgotPassword")}
          </Text>
        </TouchableOpacity>

        {/* Pas de compte */}
        <View className="flex-row justify-center mt-8 gap-1">
          <Text className="font-body text-ink-tertiary text-sm">
            {t("login.noAccount")}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="font-display-semi text-ink-secondary text-sm">
              {t("login.signUp")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
