import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../lib/theme";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="job/[id]"
          options={{ title: "Job Details", headerBackTitle: "Back" }}
        />
      </Stack>
    </AuthProvider>
  );
}
