import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import dotenv from "dotenv";
import { CommandLoader } from "./utils/commandLoader.js";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const commandLoader = new CommandLoader();

// Load all commands when bot starts
console.log("🚀 Starting Kamino Telegram Bot...");
await commandLoader.loadCommands();

// Basic handlers
bot.start((ctx) => {
  ctx.reply(
    `🎉 **Welcome to Kamino Bot!**

👋 Halo ${ctx.from.first_name}!

📚 Ketik /menu untuk melihat daftar command yang tersedia.
🔧 Bot ini memiliki berbagai fitur seperti download video, media generation, dan utility lainnya.

Happy using! 🚀`,
    { parse_mode: "Markdown" }
  );
});

// Command handler untuk semua commands yang dimulai dengan /
bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  const user = ctx.from;
  console.log(user);

  // Log user activity
  console.log(`👤 ${user.first_name} (${user.id}): ${text}`);

  // Check if message starts with /
  if (text.startsWith("/")) {
    const args = text.slice(1).split(" ");
    const commandName = args.shift().toLowerCase();

    // Check if command exists
    if (commandLoader.hasCommand(commandName)) {
      const command = commandLoader.getCommand(commandName);

      try {
        // Execute command
        await command.execute(ctx, args, commandLoader);
      } catch (error) {
        console.error(`❌ Error executing command '${commandName}':`, error);
        ctx.reply(
          `❌ Terjadi kesalahan saat menjalankan command /${commandName}`
        );
      }
    } else {
      // Command not found
      ctx.reply(
        `❌ Command /${commandName} tidak ditemukan!\n\n💡 Ketik /menu untuk melihat daftar command yang tersedia.`
      );
    }
  } else {
    // Handle non-command messages
    ctx.reply(
      `Halo, ${user.first_name}! 👋\n\n💡 Ketik /menu untuk melihat command yang tersedia.`
    );
  }
});

console.log("✅ Bot is ready and listening for messages...");
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
