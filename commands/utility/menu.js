import path from "path";
import { fileURLToPath } from "url";

export default {
  name: "menu",
  description: "Show all available commands",
  usage: "/menu [command_name]",
  category: "utility",

  async execute({ ctx, args, commandLoader, prefix = "/" }) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const imagePath = path.join(__dirname, "../../media/kamino3.png");
      if (args && args.length > 0) {
        // Show help for specific command
        const commandName = args[0];
        const command = commandLoader.getCommand(commandName);

        if (!command) {
          return ctx.reply(`❌ Command '${commandName}' tidak ditemukan!`, {
            reply_to_message_id: ctx.message.message_id,
          });
        }

        const helpText = `
📖 **${command.name.toUpperCase()}**

📝 Deskripsi: ${command.description}
📋 Penggunaan: ${command.usage.replace(/^\//, prefix)}
📁 Kategori: ${command.category}
                `.trim();

        return ctx.reply(helpText, {
          parse_mode: "Markdown",
          reply_to_message_id: ctx.message.message_id,
        });
      }

      // Show all commands grouped by category
      const commands = commandLoader.getAllCommands();
      const categories = {};

      commands.forEach((cmd) => {
        if (!categories[cmd.category]) {
          categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
      });

      let helpText = "📚 **DAFTAR COMMAND**\n\n";

      for (const [category, cmds] of Object.entries(categories)) {
        helpText += `📁 **${category.toUpperCase()}**\n`;
        cmds.forEach((cmd) => {
          helpText += `\`${prefix}${cmd.name}\`
${cmd.description}\n`;
        });
        helpText += "\n";
      }

      helpText += `💡 Gunakan \`${prefix}menu [command]\` untuk detail command tertentu`;

      ctx.replyWithPhoto(
        { source: imagePath },
        {
          caption: helpText,
          parse_mode: "Markdown",
          reply_to_message_id: ctx.message.message_id,
        }
      );
    } catch (error) {
      console.error("Help command error:", error);
      ctx.reply("❌ Terjadi kesalahan saat menampilkan help!", {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  },
};
