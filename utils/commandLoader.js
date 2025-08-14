import { readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class CommandLoader {
  constructor() {
    this.commands = new Map();
    this.commandsPath = join(__dirname, "..", "commands");
  }

  async loadCommands() {
    try {
      await this.loadCommandsFromDirectory(this.commandsPath);
      console.log(`✅ Loaded ${this.commands.size} commands`);
    } catch (error) {
      console.error("❌ Error loading commands:", error);
    }
  }

  async loadCommandsFromDirectory(dir) {
    const items = readdirSync(dir);

    for (const item of items) {
      const itemPath = join(dir, item);
      const stat = statSync(itemPath);

      if (stat.isDirectory()) {
        // Rekursif untuk folder
        await this.loadCommandsFromDirectory(itemPath);
      } else if (item.endsWith(".js")) {
        try {
          const commandModule = await import(
            `file:///${itemPath.replace(/\\/g, "/")}`
          );

          if (
            commandModule.default &&
            typeof commandModule.default === "object"
          ) {
            const command = commandModule.default;

            // Validasi struktur command
            if (command.name && command.execute) {
              this.commands.set(command.name, command);
              //console.log(`📁 Loaded command: /${command.name}`);
            } else {
              console.warn(`⚠️ Invalid command structure in ${itemPath}`);
            }
          }
        } catch (error) {
          console.error(
            `❌ Error loading command from ${itemPath}:`,
            error.message
          );
        }
      }
    }
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }

  hasCommand(name) {
    return this.commands.has(name);
  }
}
