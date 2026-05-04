import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRegisterStore } from "../../../../stores/registerStore";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function ClubIdentityScreen() {
  const router = useRouter();
  const { club, updateClub } = useRegisterStore();
  const { t } = useTranslation();

  const [clubName, setClubName] = useState(club.clubName);
  const [logoUri, setLogoUri] = useState<string | null>(club.logoUri);
  const [coverUri, setCoverUri] = useState<string | null>(club.coverUri);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async (
    setter: (uri: string) => void,
    aspect: [number, number],
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (!clubName) e.clubName = t("clubIdentity.errors.clubNameRequired");
    if (!logoUri) e.logo = t("clubIdentity.errors.logoRequired");
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    updateClub({ clubName, logoUri, coverUri });
    router.push("/(auth)/register/club/location");
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
        <StepIndicator current={2} total={5} />

        <Text className="font-display text-ink text-2xl mt-6 mb-1">
          {t("clubIdentity.title")}
        </Text>
        <Text className="font-body text-ink-tertiary text-sm mb-8">
          {t("clubIdentity.subtitle")}
        </Text>

        <View className="gap-4">
          <Input
            label={t("clubIdentity.clubName")}
            value={clubName}
            onChangeText={setClubName}
            error={errors.clubName}
            placeholder="Tennis Club de Lyon"
            autoCapitalize="words"
          />

          {/* Logo */}
          <View>
            <Text className="font-display-semi text-ink-secondary text-xs mb-1.5">
              {t("clubIdentity.logo")}
            </Text>
            <TouchableOpacity
              onPress={() => pickImage((uri) => setLogoUri(uri), [1, 1])}
              className={`border-2 border-dashed rounded-lg h-28 items-center justify-center overflow-hidden ${
                errors.logo ? "border-error" : "border-ink-border"
              }`}
            >
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Text className="text-2xl mb-1">🏟️</Text>
                  <Text className="font-display-semi text-ink-secondary text-sm">
                    {t("clubIdentity.addLogo")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.logo && (
              <Text className="font-body text-xs text-error mt-1">
                {errors.logo}
              </Text>
            )}
          </View>

          {/* Couverture */}
          <View>
            <Text className="font-display-semi text-ink-secondary text-xs mb-1.5">
              {t("clubIdentity.cover")}
            </Text>
            <TouchableOpacity
              onPress={() => pickImage((uri) => setCoverUri(uri), [16, 9])}
              className="border-2 border-dashed border-ink-border rounded-lg h-20 items-center justify-center overflow-hidden"
            >
              {coverUri ? (
                <Image
                  source={{ uri: coverUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-display-semi text-ink-tertiary text-sm">
                  {t("clubIdentity.addCover")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <Button
            label={t("clubIdentity.next")}
            onPress={handleNext}
            disabled={!clubName}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
