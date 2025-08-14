# Kamino Telegram Bot

Telegram bot sederhana

## Setup

1. Clone repository ini
2. Install dependencies:

   ```bash
   npm install
   ```

3. Isi `.env` file dan masukkan bot token dari @BotFather

4. Jalankan bot:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Cara Menambah Command Baru

1. Buat file JavaScript baru di dalam folder `commands` sesuai kategori
2. Export default object dengan struktur:

```javascript
export default {
  name: "command_name", // Nama command (tanpa /)
  description: "Command description", // Deskripsi command
  usage: "/command_name [args]", // Cara penggunaan
  category: "category_name", // Kategori command

  async execute(ctx, args, commandLoader) {
    // Logic command di sini
    // ctx = Telegraf context
    // args = Array arguments dari user
    // commandLoader = Instance CommandLoader untuk akses command lain

    try {
      // Your command logic here
      ctx.reply("Command executed successfully!");
    } catch (error) {
      console.error("Command error:", error);
      ctx.reply("❌ Terjadi kesalahan!");
    }
  },
};
```

3. Bot akan otomatis load command baru saat restart

## Commands yang Tersedia

- `/help` - Tampilkan semua command
- `/help [command]` - Tampilkan detail command tertentu
- `/ping` - Check response time bot
- `/fb [url]` - Download Facebook video
- `/brat [text]` - Generate brat style text image

## Fitur

- ✅ **Modular Command System** - Commands terpisah per file
- ✅ **Auto Command Loading** - Otomatis load semua commands dari folder
- ✅ **Kategori Command** - Commands dikelompokkan berdasarkan kategori
- ✅ **Error Handling** - Handle error dengan baik
- ✅ **Help System** - Built-in help command
- ✅ **Extensible** - Mudah menambah command baru

## Development

- File utama: `main.js`
- Command loader: `utils/commandLoader.js`
- Commands folder: `commands/`
- Environment: `.env`

Bot akan otomatis reload commands setiap kali restart.
