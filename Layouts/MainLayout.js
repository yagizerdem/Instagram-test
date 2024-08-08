import { Link, useNavigation } from "@react-navigation/native";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Dimensions } from "react-native";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome icons
import { useEffect, useState } from "react";
import supabase from "../supabase";

export default function MainLayout({ children }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [userid, setUserId] = useState("");

  useEffect(() => {
    async function helper() {
      const { error, data } = await supabase.auth.getUser();
      setUserId(data.user.id);
    }
    helper();
  }, []);

  return (
    <SafeAreaView>
      <View
        style={{
          height: windowHeight - insets.top,
          marginTop: insets.top / 2,
        }}
      >
        <View style={styles.main}>{children}</View>
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <FontAwesome name="home" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <FontAwesome name="search" size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Post")}>
            <FontAwesome name="edit" size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Profile", {
                userid,
              })
            }
          >
            <FontAwesome name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  footer: {
    width: windowWidth,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    height: 40,
    alignItems: "center",
  },
});
