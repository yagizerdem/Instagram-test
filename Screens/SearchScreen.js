import { Fragment, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import MainLayout from "../Layouts/MainLayout";
import useDebounce from "../hooks/useDebounce";
import supabase from "../supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

// add pagination
const limit = 10;

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [isLoading, setIsLoding] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [hasEnd, setHasEnd] = useState(false);
  const [page, setPage] = useState(0);
  const navigation = useNavigation();

  async function fetch(page) {
    if (debouncedQuery.trim().length == 0) return;
    const start = page * limit;
    const end = start + limit - 1;
    setPage((prev) => prev + 1);
    try {
      setHasEnd(false);
      setIsLoding(true);

      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("user_name", debouncedQuery)
        .range(start, end);

      if (data.length == 0) {
        setHasEnd(true);
      }

      if (error) throw error;

      setProfiles((prev) => [...prev, ...data]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoding(false);
    }
  }

  useEffect(() => {
    setProfiles([]);
    setPage(0);
    fetch(0);
  }, [debouncedQuery]);

  function renderItem({ item }) {
    const derivedState = !item["profile_image"]
      ? require("../assets/profile.webp")
      : { uri: `data:image/jpeg;base64,${item["profile_image"]}` };

    return (
      <Fragment>
        <LinearGradient
          colors={["#000000", "#434343"]} // Dark gradient colors
          start={[0, 0]} // Top-left corner
          end={[1, 1]} // Bottom-right corner
          style={styles.gradient}
        >
          <Image source={derivedState} style={styles.listpp}></Image>
          <Text style={styles.username}>{item["user_name"]}</Text>
          <TouchableOpacity
            style={styles.goToProfileButton}
            onPress={() => goToProfile(item.id)}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 15,
              }}
            >
              go to profile
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Fragment>
    );
  }

  function goToProfile(userid) {
    return navigation.navigate("Profile", { userid });
  }

  function handleLoadMore() {
    if (hasEnd) return;
    fetch(page);
    console.log("load more ...");
  }

  return (
    <Fragment>
      <MainLayout>
        <View
          style={{
            flex: 1,
            backgroundColor: "#28282B",
          }}
        >
          <Text style={styles.header}>Search other users</Text>
          <TextInput
            onChangeText={(e) => setQuery(e)}
            style={styles.textInput}
          ></TextInput>

          <FlatList
            style={styles.list}
            data={profiles}
            keyExtractor={(item, index) => index}
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5} // Trigger load more when 50% from the end
            ListFooterComponent={
              isLoading ? <ActivityIndicator size="large" color="#fff" /> : null
            }
          />
        </View>
      </MainLayout>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  header: {
    fontWeight: "bold",
    fontSize: 30,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
    color: "white",
  },
  textInput: {
    width: 200,
    height: 40,
    backgroundColor: "#F7CAC9",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 10,
    borderRadius: 5,
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    width: "100%",
    marginTop: 40,
    marginBottom: 40,
    height: 500,
  },
  gradient: {
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
    padding: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    height: "auto",

    backgroundColor: "gray",
  },
  listpp: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 30,
    color: "white",
  },
  goToProfileButton: {
    width: 100,
    margin: "auto",
    marginTop: 20,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#405DE6",
    borderRadius: 5,
  },
});
