import { Fragment, useEffect, useReducer } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  ToastAndroid,
} from "react-native";
import MainLayout from "../Layouts/MainLayout";
import supabase from "../supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

function reducer(state, action) {
  switch (action.type) {
    case "setUserData":
      return {
        ...state, // Spread the previous state
        username: action.userName, // Update the username
        profileDerivedSource: action.profileDerivedSource,
        loading: false,
      };
    case "setBase64":
      const deepCopy = JSON.parse(JSON.stringify(state.imageFileUrls));
      deepCopy.push(action.payload);
      return {
        ...state,
        imageFileUrls: deepCopy,
      };
    case "setIsAdmin":
      return {
        ...state,
        isAdmin: action.payload,
      };
    case "clearImages":
      return {
        ...state,
        imageFileUrls: [],
      };

    default:
      return state; // Return the current state if action type is unknown
  }
}

export default function ProfileScreen({ route, navigation }) {
  const { userid } = route.params;
  const [state, dispatch] = useReducer(reducer, {
    username: "",
    followers: 0,
    following: 0,
    isAdmin: true,
    loading: true,
    profileDerivedSource: null,
    imageFileUrls: [],
  });

  // profile img
  useEffect(() => {
    async function helper() {
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", userid)
        .single();

      dispatch({
        userName: data["user_name"],
        profileDerivedSource: !data["profile_image"]
          ? require("../assets/profile.webp")
          : { uri: `data:image/jpeg;base64,${data["profile_image"]}` },
        type: "setUserData",
      });
    }
    helper();
  }, [userid]);

  // images from blolb storage
  useEffect(() => {
    dispatch({ type: "clearImages" });
    async function helper() {
      const { data } = await supabase.storage.from("test").list(userid);
      const urls = data.map((fileObj) => {
        return `${userid}/${fileObj.name}`;
      });

      urls.forEach((blobStoragePath) => {
        supabase.storage
          .from("test")
          .download(blobStoragePath)
          .then(({ data }) => {
            if (data["_data"].size == 0) return;

            const fr = new FileReader();
            fr.readAsDataURL(data);
            fr.onload = () => {
              dispatch({ type: "setBase64", payload: fr.result });
            };
          });
      });
    }
    helper();
  }, [userid]);

  const renderItem = function ({ item }) {
    return (
      <Image
        style={{
          width: 100,
          height: 100,
          backgroundColor: "red",
          margin: 20,
        }}
        source={{
          uri: item,
        }}
      ></Image>
    );
  };

  // check is admin
  useEffect(() => {
    async function helper() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        console.log(userid);
        var isAdmin = data.user.id == userid;
        dispatch({ type: "setIsAdmin", payload: isAdmin });
      } catch (error) {
        console.log(error);
      }
    }
    helper();
  }, [userid]);

  async function followRequest() {
    try {
      var { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const useruuid = data.user.id;

      var { error } = await supabase
        .from("requests")
        .insert({ fromuuid: useruuid, touuid: userid });
      if (error) throw error;

      ToastAndroid.show("request send successfull", ToastAndroid.SHORT);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Fragment>
      <MainLayout>
        <View
          style={{
            position: "absolute",
            right: 0,
            marginRight: 10,
          }}
        >
          {!state.isAdmin && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Chat", {
                  toUserId: userid,
                });
              }}
            >
              <FontAwesome name="comment" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.header}>
          <Image
            source={state.profileDerivedSource}
            style={styles.profileImage}
          />
          {!state.loading && (
            <Fragment>
              <Text style={styles.username}> {state.username} </Text>
              {state.isAdmin && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                >
                  <Text style={styles.settings}>settings</Text>
                </TouchableOpacity>
              )}
            </Fragment>
          )}
          {state.loading && (
            <Fragment>
              <ActivityIndicator size="large" color="#00ff00" />
            </Fragment>
          )}
        </View>
        {!state.isAdmin && (
          <TouchableOpacity
            style={styles.followbutton}
            onPress={() => followRequest()}
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        )}

        <FlatList
          numColumns={3}
          data={state.imageFileUrls}
          renderItem={renderItem}
          keyExtractor={(item, index) => index}
          style={styles.flatList}
        />
      </MainLayout>
    </Fragment>
  );
}
const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: "auto",
    display: "flex",
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 20,
  },
  settings: {
    marginTop: 10,
    color: "blue",
  },
  username: {
    fontSize: 20,
  },
  flatList: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  followbutton: {
    width: 200,
    height: 30,
    backgroundColor: "#5B51D8",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  followButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
