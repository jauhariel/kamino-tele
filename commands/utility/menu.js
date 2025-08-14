export default {
  name: "menu",
  description: "Show all available commands",
  usage: "/menu [command_name]",
  category: "utility",

  async execute(ctx, args, commandLoader) {
    try {
      if (args && args.length > 0) {
        // Show help for specific command
        const commandName = args[0];
        const command = commandLoader.getCommand(commandName);

        if (!command) {
          return ctx.reply(`❌ Command '${commandName}' tidak ditemukan!`);
        }

        const helpText = `
📖 **${command.name.toUpperCase()}**

📝 Deskripsi: ${command.description}
📋 Penggunaan: ${command.usage}
📁 Kategori: ${command.category}
                `.trim();

        return ctx.reply(helpText, { parse_mode: "Markdown" });
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
          helpText += `• /${cmd.name} - ${cmd.description}\n`;
        });
        helpText += "\n";
      }

      helpText += "💡 Gunakan `/help [command]` untuk detail command tertentu";

      ctx.reply(helpText, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Help command error:", error);
      ctx.reply("❌ Terjadi kesalahan saat menampilkan help!");
    }
  },
};
