import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useTranslation } from "../../hooks/useTranslation";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "ace://auth/reset",
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 px-6 py-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="font-display-semi text-ink-tertiary text-sm">
            {t("forgotPassword.back")}
          </Text>
        </TouchableOpacity>

        <Text className="font-display text-ink text-2xl mb-2">
          {t("forgotPassword.title")}
        </Text>
        <Text className="font-body text-ink-tertiary text-sm mb-8">
          {t("forgotPassword.subtitle")}
        </Text>

        {sent ? (
          <View className="bg-success/10 border border-success rounded-md p-4">
            <Text className="font-display-semi text-success text-sm text-center">
              {t("forgotPassword.success")}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            <Input
              label={t("forgotPassword.email")}
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error && (
              <Text className="font-body text-xs text-error">{error}</Text>
            )}
            <Button
              label={t("forgotPassword.submit")}
              onPress={handleReset}
              loading={loading}
              disabled={!email}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
