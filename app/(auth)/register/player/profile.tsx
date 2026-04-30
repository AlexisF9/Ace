import { useState } from "react";
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRegisterStore } from "../../../../stores/registerStore";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";
import { StepIndicator } from "../../../../components/register/StepIndicator";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function PlayerProfileScreen() {
  const router = useRouter();
  const { player, updatePlayer } = useRegisterStore();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState(player.firstName);
  const [lastName, setLastName] = useState(player.lastName);
  const [username, setUsername] = useState(player.username);
  const [city, setCity] = useState(player.city);
  const [avatarUri, setAvatarUri] = useState<string | null>(player.avatarUri);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName) e.firstName = t("playerProfile.errors.firstNameRequired");
    if (!lastName) e.lastName = t("playerProfile.errors.lastNameRequired");
    if (!username) e.username = t("playerProfile.errors.usernameRequired");
    else if (!/^[a-z0-9_]{3,20}$/.test(username))
      e.username = t("playerProfile.errors.usernameInvalid");
    if (!city) e.city = t("playerProfile.errors.cityRequired");
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    updatePlayer({ firstName, lastName, username, city, avatarUri });
    router.push("/(auth)/register/player/sports");
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
        <StepIndicator current={2} total={4} />

        <Text className="font-display text-ink text-2xl mt-6 mb-1">
          {t("playerProfile.title")}
        </Text>
        <Text className="font-body text-ink-tertiary text-sm mb-8">
          {t("playerProfile.subtitle")}
        </Text>

        {/* Avatar */}
        <TouchableOpacity onPress={pickAvatar} className="items-center mb-6">
          <View className="w-20 h-20 rounded-pill bg-orange-light items-center justify-center overflow-hidden">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full" />
            ) : (
              <Text className="text-3xl">👤</Text>
            )}
          </View>
          <Text className="font-display-semi text-ink-secondary text-sm mt-2">
            {avatarUri ? t("playerProfile.changePhoto") : t("playerProfile.addPhoto")}
          </Text>
        </TouchableOpacity>

        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label={t("playerProfile.firstName")}
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                placeholder="Thomas"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <Input
                label={t("playerProfile.lastName")}
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                placeholder="Martin"
                autoCapitalize="words"
              />
            </View>
          </View>
          <Input
            label={t("playerProfile.username")}
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())}
            error={errors.username}
            placeholder="thomas_m"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label={t("playerProfile.city")}
            value={city}
            onChangeText={setCity}
            error={errors.city}
            placeholder="Lyon"
            autoCapitalize="words"
          />
        </View>

        <View className="mt-8">
          <Button
            label={t("playerProfile.next")}
            onPress={handleNext}
            disabled={!firstName || !lastName || !username || !city}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
