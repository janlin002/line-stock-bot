import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function replyMessage(replyToken, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );
}

export async function pushMessage(userId, text) {
  try {
    console.log("📤 PUSH REQUEST");
    console.log("userId:", userId);
    console.log("token exists:", !!LINE_TOKEN);

    const res = await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: userId,
        messages: [{ type: "text", text }],
      },
      {
        headers: {
          Authorization: `Bearer ${LINE_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ LINE PUSH SUCCESS:", res.data);
  } catch (err) {
    console.log("❌ LINE PUSH FAILED:");
    console.log(err.response?.status);
    console.log(err.response?.data);
    console.log(err.message);
  }
}
