import { Telegraf } from "telegraf";
import "./config.js";
import { CommandLoader } from "./utils/commandLoader.js";
import fs from "fs";
import path from "path";

const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  // console.log("📁 Created tmp directory");
}

if (global.token) {
  console.log("✅ Bot token is set.");
} else {
  console.error("❌ Bot token is not set.");
}

const bot = new Telegraf(global.token);
const commandLoader = new CommandLoader();

// Load all commands when bot starts
console.log("🚀 Starting Kamino Telegram Bot...");
await commandLoader.loadCommands();

// Basic handlers
bot.start((ctx) => {
  ctx.reply(
    `🎉 **Welcome to Kamino Bot!**

👋 Halo ${ctx.from.first_name}!

📚 Ketik /menu atau .menu untuk melihat daftar command yang tersedia.
🔧 Bot ini memiliki berbagai fitur seperti download video, media generation, dan utility lainnya.

💡 **Tip**: Anda bisa menggunakan prefix / atau . untuk menjalankan command
   Contoh: /info atau .info

Happy using! 🚀`,
    {
      parse_mode: "Markdown",
      reply_to_message_id: ctx.message.message_id,
    }
  );
});

bot.on("message", async (ctx) => {
  const m = ctx.message;
  m.id = m.chat.id;
  m.userId = m.from.id;
  m.isGroup = m.chat.type === "group" || m.chat.type === "supergroup";
  m.nameGroup = m.isGroup ? m.chat.title : null;
  m.userNameGroup = m.isGroup ? m.chat.username : null;
  m.isBot = m.from.is_bot;
  m.name = m.from.first_name;
  m.userName = m.from.username;
  m.language = m.from.language_code;
  m.commandText = m.text || m.caption || "";
  m.isReply = m.reply_to_message ? true : false;

  console.log(m);
  // Log user activity
  console.log(`👤 ${m.userName} (${m.userId}): ${m.commandText}`);

  const text = m.commandText;

  // Check if message starts with / or .
  if (text.startsWith("/") || text.startsWith(".")) {
    const prefix = text.charAt(0);

    // Handle spasi setelah prefix dengan cara yang lebih fleksibel
    let commandText = text.slice(1).trim(); // Remove prefix dan trim spasi

    // Jika tidak ada text setelah prefix, skip
    if (!commandText) {
      return ctx.reply(
        `❌ Command tidak boleh kosong!\n\n💡 Ketik ${prefix}menu untuk melihat daftar command yang tersedia.`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }

    const args = commandText.split(/\s+/); // Split dengan regex untuk handle multiple spaces
    const commandName = args.shift().toLowerCase();

    // Check if command exists
    if (commandLoader.hasCommand(commandName)) {
      const command = commandLoader.getCommand(commandName);

      try {
        // Execute command dengan mengirimkan prefix yang digunakan
        await command.execute({ ctx, m, args, commandLoader, prefix });
      } catch (error) {
        console.error(`❌ Error executing command '${commandName}':`, error);
        ctx.reply(
          `❌ Terjadi kesalahan saat menjalankan command ${prefix}${commandName}`,
          { reply_to_message_id: ctx.message.message_id }
        );
      }
    } else {
      // Command not found
      ctx.reply(
        `❌ Command ${prefix}${commandName} tidak ditemukan!\n\n💡 Ketik ${prefix}menu untuk melihat daftar command yang tersedia.`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
  } else {
    // Handle non-command messages
    ctx.reply(
      `Halo, ${m.name}! 👋\n\n💡 Ketik /menu atau .menu untuk melihat command yang tersedia.`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
});

console.log("✅ Bot is ready and listening for messages...");
bot.launch({ dropPendingUpdates: true });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
