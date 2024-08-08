import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ToastAndroid,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import supabase from "../supabase";
import { useNavigation } from "@react-navigation/native";

export default function AuthScreen() {
  const navigation = useNavigation();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("yagiz2@gmail.com");
  const [password, setPassword] = useState("123456");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function helper() {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        return navigation.navigate("Home");
      }
    }
    helper();
  }, []);

  async function signUpHandler() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          user_name: userName,
        },
      },
    });
    if (error) {
      return ToastAndroid.show(
        error.message || "unknown error occured ... ",
        ToastAndroid.SHORT
      );
    }

    navigation.navigate("Home");
    return ToastAndroid.show("sign up successfull ...", ToastAndroid.SHORT);
  }

  async function signInHandler() {
    const { user, session, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      return ToastAndroid.show(
        error.message || "unknown error occured ... ",
        ToastAndroid.SHORT
      );
    }
    navigation.navigate("Home");
    return ToastAndroid.show("sign in successfull ...", ToastAndroid.SHORT);
  }

  return (
    <LinearGradient
      colors={["#F58529", "#FEDA77", "#DD2A7B", "#8134AF"]}
      start={{ x: 0, y: 0 }} // Start from top-left
      end={{ x: 1, y: 1 }} // End at bottom-right
      style={styles.container}
    >
      <Text style={styles.header}>Instagram</Text>
      <View style={styles.panel}>
        {isSignUp && (
          <View style={styles.signUp}>
            <TextInput
              placeholder="enter user name"
              style={styles.textInput}
              onChangeText={(userName) => setUserName(userName)}
            ></TextInput>
            <TextInput
              placeholder="enter e mail"
              style={styles.textInput}
              onChangeText={(email) => setEmail(email)}
            ></TextInput>
            <TextInput
              placeholder="enter password"
              style={styles.textInput}
              onChangeText={(password) => setPassword(password)}
            ></TextInput>
            <Button onPress={signUpHandler} title="sign Up" color="#841584" />
          </View>
        )}
        {!isSignUp && (
          <View style={styles.signUp}>
            <TextInput
              placeholder="enter e mail"
              style={styles.textInput}
              onChangeText={(email) => setEmail(email)}
            ></TextInput>
            <TextInput
              placeholder="enter password"
              style={styles.textInput}
              onChangeText={(password) => setPassword(password)}
            ></TextInput>
            <Button onPress={signInHandler} title="sign In" color="#841584" />
          </View>
        )}
      </View>
      <Button
        title={`switch ${isSignUp ? "to sign In" : "sign Up"}`}
        onPress={() => setIsSignUp((prev) => !prev)}
      ></Button>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: 250,
    height: 250,
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    marginBottom: 20,
  },
  header: {
    fontWeight: "bold",
    fontSize: 40,
  },
  signUp: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  textInput: {
    width: 200,
    height: 40,
    borderColor: "#000", // Border color (black in this case)
    borderWidth: 2, // Border width
    borderRadius: 5, // Optional: rounded corners
    paddingHorizontal: 10, // Optional: add some padding inside the TextInput
    marginTop: 10,
    marginBottom: 10,
  },
});
