import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Home, Newspaper, User } from "lucide-react-native";
import { colors } from "../../constants/theme";
import { useAuthStore } from "../../stores/authStore";
import { useSportsStore } from "../../stores/sportsStore";
import { useTranslation } from "../../hooks/useTranslation";

function SportsInit() {
  const { session, profile } = useAuthStore();
  const { initialize, reset } = useSportsStore();

  useEffect(() => {
    if (session && profile) {
      initialize(session.user.id, profile.account_type);
    } else if (!session) {
      reset();
    }
  }, [session?.user.id, profile?.account_type]);

  return null;
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <>
      <SportsInit />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.inkTertiary,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.inkBorder,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.feed"),
            tabBarIcon: ({ color, size }) => (
              <Home color={color} size={size} strokeWidth={1.75} />
            ),
          }}
        />
        <Tabs.Screen
          name="news"
          options={{
            title: t("tabs.news"),
            tabBarIcon: ({ color, size }) => (
              <Newspaper color={color} size={size} strokeWidth={1.75} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} strokeWidth={1.75} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
