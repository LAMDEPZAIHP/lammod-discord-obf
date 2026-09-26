const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const API_URL =
  "https://lam-mod-host.onrender.com/api/obfuscate";

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (!message.content.trim().startsWith(".obf")) return;

  const file = message.attachments.first();

  if (!file) {
    return message.reply(
      "❌ Hãy gửi `.obf` kèm file `.lua` hoặc `.txt`."
    );
  }

  const name = file.name.toLowerCase();

  if (!name.endsWith(".lua") && !name.endsWith(".txt")) {
    return message.reply(
      "❌ Chỉ hỗ trợ file `.lua` hoặc `.txt`."
    );
  }

  const loading = await message.reply("⏳ Đang obfuscate...");

  try {
    const fileResponse = await fetch(file.url);

    if (!fileResponse.ok) {
      throw new Error("Không tải được file");
    }

    const code = await fileResponse.text();

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    if (!apiResponse.ok) {
      throw new Error(`API HTTP ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (!data.success || !data.code) {
      throw new Error("API không trả code obfuscate");
    }

    const output = Buffer.from(data.code, "utf8");

    const outputName =
      name.replace(/\.(lua|txt)$/i, "") +
      "_obfuscated.lua";

    const attachment = new AttachmentBuilder(output, {
      name: outputName
    });

    await message.channel.send({
      content: "✅ **Obfuscate thành công!**",
      files: [attachment]
    });

    await loading.delete();

  } catch (error) {
    console.error(error);

    await loading.edit(
      "❌ Obfuscate thất bại."
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
