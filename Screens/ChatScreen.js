import { Fragment, useEffect, useState } from "react";
import {
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  View,
} from "react-native";
import supabase from "../supabase";
import MessageModel from "../MessageModel";

export default function ChatScreen({ route, navigation }) {
  const { toUserId } = route.params;
  const [text, setText] = useState(null);
  const [channel, setChannel] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [fromUserId, setFromUserId] = useState(null);

  useEffect(() => {
    async function helper() {
      try {
        var { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setFromUserId(data.user.id);
      } catch (err) {
        console.log(err);
      }
    }
    helper();
  }, []);

  async function sendChat() {
    channel.send({
      type: "broadcast",
      event: "test",
      payload: { message: text },
    });
  }

  useEffect(() => {
    // fetch messages before

    if (!channel && fromUserId) {
      const channel_ = supabase.channel("room", {
        config: {
          broadcast: { self: true },
        },
      });
      channel_
        .on("broadcast", { event: "test" }, (payload) =>
          messageReceived(payload)
        )
        .subscribe();
      setChannel(channel_);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [toUserId, channel, fromUserId]);

  function messageReceived(payload) {
    const messageModel = new MessageModel();
    messageModel.from = fromUserId;
    messageModel.to = toUserId;
    messageModel.message = payload.payload.message;
    messageModel.image = null;

    const model = { ...messageModel };
    async function helper() {
      try {
        if (!fromUserId) return;
        var { error } = await supabase.from("messages").insert(model);
        if (error) throw error;
      } catch (err) {
        console.log(err);
      }
    }
    helper();

    setAllMessages((prev) => [...prev, messageModel]);
  }

  function renderer(data) {
    return (
      <Fragment>
        <View
          style={{
            width: "80%",
            height: "auto",
            padding: 10,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 30,
          }}
        >
          <Text
            style={{
              textAlign: "center",
            }}
          >
            {data.item.message}
          </Text>
        </View>
      </Fragment>
    );
  }

  console.log(allMessages);

  return (
    <Fragment>
      <SafeAreaView style={{ marginTop: 50 }}>
        <TextInput
          onChangeText={(e) => setText(e)}
          style={{
            backgroundColor: "#152d32",
            color: "white",
            width: "80%",
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 4,
            marginBottom: 20,
          }}
        ></TextInput>
        <TouchableOpacity style={styles.button} onPress={sendChat}>
          <Text style={styles.buttonText}>Send Chat</Text>
        </TouchableOpacity>
        <FlatList
          data={allMessages}
          renderItem={renderer}
          keyExtractor={(item, index) => index}
          style={{}}
        />
      </SafeAreaView>
    </Fragment>
  );
}
const styles = StyleSheet.create({
  input: {
    backgroundColor: "black",
    color: "white",
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007BFF", // Button background color
    padding: 10,
    borderRadius: 5, // Rounded corners
    alignItems: "center", // Center text horizontally
    width: 150, // Set the width of the button
    alignSelf: "center", // Center the button horizontally in its container
  },
  buttonText: {
    color: "white", // Text color
    fontSize: 16, // Text size
  },
});
