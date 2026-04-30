import { View, Text, Image, ImageBackground, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { useTranslation } from "../../hooks/useTranslation";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Background photo plein écran */}
      <ImageBackground
        source={require("../../assets/bg-welcome.jpg")}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Overlay sombre pour lisibilité */}
        <View className="flex-1 bg-black/40">
          {/* Sélecteur de langue en haut à droite */}
          <View className="absolute top-14 right-4 z-10">
            <LanguageSwitcher variant="dark" />
          </View>

          {/* Logo en haut */}
          <View className="flex-1 items-center justify-start pt-20 px-6">
            <Image
              source={require("../../assets/icon.png")}
              className="w-16 h-16 rounded-2xl mb-4"
              resizeMode="contain"
            />
            <Text className="font-display-bold text-white text-5xl tracking-widest">
              ACE
            </Text>
            <Text className="font-body text-white/70 text-base mt-2 text-center">
              {t("welcome.tagline")}
            </Text>
          </View>

          {/* Boutons en bas */}
          <View className="px-6 pb-12 gap-3">
            <Button
              label={t("welcome.login")}
              onPress={() => router.push("/(auth)/login")}
              variant="primary"
            />
            <Button
              label={t("welcome.register")}
              onPress={() => router.push("/(auth)/register")}
              variant="outline-white"
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
