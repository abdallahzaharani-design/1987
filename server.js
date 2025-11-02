import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "abdullah-bot";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/", (req, res) => res.send("WhatsApp Cloud Bot is running ✅"));

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
  res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = message?.from;
  const text = message?.text?.body?.trim();
  if (from && text) {
    let reply = "أهلًا! اكتب 'menu' أو 'قائمة' لرؤية الخيارات.";
    if (/menu|قائمة|help|مساعدة/i.test(text)) reply = "مرحبا! 🌟\n1) سعر اليوم\n2) الدعم\n3) عنّا";
    else if (/^1$/.test(text)) reply = "سعر اليوم 123.45 – بيانات تجريبية 😉";
    else if (/^2$/.test(text)) reply = "تواصل معنا عبر البريد: support@example.com";
    else if (/^3$/.test(text)) reply = "نحن بوت واتساب تجريبي 💚";

    await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to: from, text: { body: reply } },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" } }
    );
  }
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Bot running on port", port));
