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

// Command handler untuk semua commands yang dimulai dengan / atau .
bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  const user = ctx.from;
  console.log(user);

  // Log user activity
  console.log(`👤 ${user.first_name} (${user.id}): ${text}`);

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
        await command.execute(ctx, args, commandLoader, prefix);
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
      `Halo, ${user.first_name}! 👋\n\n💡 Ketik /menu atau .menu untuk melihat command yang tersedia.`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
});

console.log("✅ Bot is ready and listening for messages...");
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
