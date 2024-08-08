import { Fragment, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import MainLayout from "../Layouts/MainLayout";
import * as ImagePicker from "expo-image-picker";
import { ImageEditor } from "expo-image-editor";
import * as FileSystem from "expo-file-system";
import supabase from "../supabase";
import { decode } from "base64-arraybuffer";
import uuid from "react-native-uuid";
import { useNavigation } from "@react-navigation/native";

export default function PostScreen() {
  const [imageUri, setImageUri] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [file, setFile] = useState(null);
  const navigation = useNavigation();

  async function loadImage() {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      launchEditor(uri);
    } else {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }
  }

  const launchEditor = (uri) => {
    // Then set the image uri
    setImageUri(uri);
    // And set the image editor to be visible
    setEditorVisible(true);
  };

  async function post() {
    try {
      const user = await supabase.auth.getUser();

      // extension
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const mimeType = blob["_data"].type;
      const extension = blob["_data"].type.split("/")[1];

      const filePath = `${user.data.user.id}/${uuid.v4()}.${extension}`;

      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "base64",
      });

      var { data, error } = await supabase.storage
        .from("test")
        .upload(filePath, decode(base64), {
          contentType: mimeType, // Adjust the MIME type as needed
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;
      navigation.navigate("Home");

      return ToastAndroid.show("image upload successful", ToastAndroid.SHORT);
    } catch (err) {
      console.log(err);
      return ToastAndroid.show(
        err.message || "unknown error occured ... ",
        ToastAndroid.SHORT
      );
    }
  }

  return (
    <Fragment>
      <MainLayout>
        <View style={styles.wrapper}>
          <Image
            style={{
              height: 300,
              width: 300,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 10,
              marginBottom: 20,
            }}
            source={
              imageUri.trim().length == 0
                ? require("../assets/noimage.jpg")
                : { uri: imageUri }
            }
          />
          <TouchableOpacity
            style={styles.selectPhotobtn}
            onPress={() => loadImage()}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              select image
            </Text>
          </TouchableOpacity>
          <Text style={styles.result}>Result</Text>
          {editorVisible && (
            <ImageEditor
              visible={editorVisible}
              onCloseEditor={() => setEditorVisible(false)}
              imageUri={imageUri}
              fixedCropAspectRatio={16 / 9}
              lockAspectRatio={1}
              minimumCropDimensions={{
                width: 100,
                height: 100,
              }}
              onEditingComplete={(result) => {
                setFile(result);
              }}
              mode="full"
            />
          )}

          <Image
            style={{
              height: 300,
              width: 300,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 10,
              marginBottom: 20,
            }}
            source={
              !file ? require("../assets/noimage.jpg") : { uri: file.uri }
            }
          ></Image>

          <TouchableOpacity
            style={styles.selectPhotobtn}
            onPress={() => post()}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Post Image{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </MainLayout>
    </Fragment>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    overflow: "scroll",
  },
  selectPhoto: {
    backgroundColor: "#007BFF", // Button background color
    padding: 10, // Padding inside the button
    borderRadius: 5, // Rounded corners
    width: 200, // Width of the button
    alignItems: "center", // Center the text horizontally
  },
  selectPhotobtn: {
    width: 150,
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#4984B8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  result: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 20,
  },
});
