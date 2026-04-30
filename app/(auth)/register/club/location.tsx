import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useRegisterStore } from "../../../../stores/registerStore";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function ClubLocationScreen() {
  const router = useRouter();
  const { club, updateClub } = useRegisterStore();
  const { t } = useTranslation();

  const [address, setAddress] = useState(club.address);
  const [postalCode, setPostalCode] = useState(club.postalCode);
  const [city, setCity] = useState(club.city);
  const [phone, setPhone] = useState(club.phone);
  const [website, setWebsite] = useState(club.website);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (!address) e.address = t("clubLocation.errors.addressRequired");
    if (!postalCode) e.postalCode = t("clubLocation.errors.postalCodeRequired");
    if (!city) e.city = t("clubLocation.errors.cityRequired");
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    updateClub({ address, postalCode, city, phone, website });
    router.push("/(auth)/register/club/sports");
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
        <StepIndicator current={3} total={5} />

        <Text className="font-display text-ink text-2xl mt-6 mb-1">
          {t("clubLocation.title")}
        </Text>
        <Text className="font-body text-ink-tertiary text-sm mb-8">
          {t("clubLocation.subtitle")}
        </Text>

        <View className="gap-4">
          <Input
            label={t("clubLocation.address")}
            value={address}
            onChangeText={setAddress}
            error={errors.address}
            placeholder="12 rue des Sports"
            autoCapitalize="words"
          />
          <View className="flex-row gap-3">
            <View className="w-28">
              <Input
                label={t("clubLocation.postalCode")}
                value={postalCode}
                onChangeText={setPostalCode}
                error={errors.postalCode}
                placeholder="69001"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <View className="flex-1">
              <Input
                label={t("clubLocation.city")}
                value={city}
                onChangeText={setCity}
                error={errors.city}
                placeholder="Lyon"
                autoCapitalize="words"
              />
            </View>
          </View>
          <Input
            label={t("clubLocation.phone")}
            value={phone}
            onChangeText={setPhone}
            placeholder="04 78 00 00 00"
            keyboardType="phone-pad"
          />
          <Input
            label={t("clubLocation.website")}
            value={website}
            onChangeText={setWebsite}
            placeholder="https://monclub.fr"
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View className="mt-8">
          <Button
            label={t("clubLocation.next")}
            onPress={handleNext}
            disabled={!address || !postalCode || !city}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
