import { Fragment, useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import supabase from "../supabase";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";

export default function SettingsScreen() {
  const [base64, setBase64] = useState("");
  const navigation = useNavigation();
  const [userProfile, setuserProfile] = useState(null);

  useEffect(() => {
    async function helper() {
      try {
        var { error, data } = await supabase.auth.getUser();
        if (error) {
          throw new Error(error);
        }
        const userFromDb = data.user;
        const userid = userFromDb.id;

        var { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userid)
          .single();

        setuserProfile(userProfile);
        setBase64(userProfile["profile_image"]);
      } catch (err) {
        console.log(err);
      }
    }

    helper();
  }, []);
  const soureceDerivedState = !base64
    ? require("../assets/profile.webp")
    : { uri: `data:image/jpeg;base64,${base64}` };

  async function loadImage() {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const base64Data = await FileSystem.readAsStringAsync(
          result.assets[0].uri,
          {
            encoding: FileSystem?.EncodingType?.Base64,
          }
        );
        setBase64(base64Data);
      } catch (err) {
        console.log(err);
      }
    } else {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
  }

  async function save() {
    // save base 64 string  to db
    var { error } = await supabase
      .from("profiles")
      .update({ profile_image: base64 })
      .eq("id", userProfile.id);

    navigation.navigate("Home");
  }
  async function logOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error);
      }
      Alert.alert("log out successfull ...");
      navigation.navigate("Auth");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Fragment>
      <SafeAreaView style={styles.container}>
        <Button
          title="go back"
          onPress={() => navigation.navigate("Home")}
        ></Button>
        <Text style={styles.header}>Settings</Text>
        <TouchableOpacity onPress={() => loadImage()}>
          <Image source={soureceDerivedState} style={styles.image} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.save} onPress={() => save()}>
          <View>
            <Text style={styles.savebtn}>save</Text>
          </View>
        </TouchableOpacity>

        <Button title="log out" onPress={logOut}></Button>
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    marginTop: 10,
    fontSize: 30,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 20,
  },
  save: {
    marginTop: 20,
    backgroundColor: "#4984B8",
    width: 140,
    height: 30,
    direction: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  savebtn: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 20,
  },
});
