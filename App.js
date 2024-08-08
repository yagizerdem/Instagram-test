import { StyleSheet, Text, View } from "react-native";
import AuthScreen from "./Screens/AuthScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Component, Fragment } from "react";
import HomeScreen from "./Screens/HomeScreen";
import ProfileScreen from "./Screens/ProfileScreen";
import PostScreen from "./Screens/PostScreen";
import SearchScreen from "./Screens/SearchScreen";
import ChatScreen from "./Screens/ChatScreen";
import SettingsScreen from "./Screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Fragment>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Group
            screenLayout={({ children }) => (
              <ErrorBoundary>
                <React.Suspense
                  fallback={
                    <View style={styles.fallback}>
                      <Text style={styles.text}>Loading…</Text>
                    </View>
                  }
                >
                  {children}
                </React.Suspense>
              </ErrorBoundary>
            )}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Post"
              component={PostScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </Fragment>
  );
}
