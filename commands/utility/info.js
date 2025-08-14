import os from "os";
import fs from "fs";
import { execSync } from "child_process";
import axios from "axios";

async function getIPInfo() {
  try {
    // Try first API: ipapi.co
    const response = await axios.get("https://ipapi.co/json");
    const data = response.data;

    return {
      country: data.country_name,
      city: data.city,
      org: data.org,
    };
  } catch (error) {
    console.error("Gagal mengambil informasi dari ipapi.co:", error.message);

    try {
      // Fallback to second API: ipinfo.io
      const response = await axios.get("https://ipinfo.io/json");
      const data = response.data;

      return {
        country: data.country,
        city: data.city,
        org: data.org,
      };
    } catch (fallbackError) {
      console.error(
        "Gagal mengambil informasi dari ipinfo.io:",
        fallbackError.message
      );
      return {
        country: "Tidak diketahui",
        city: "Tidak diketahui",
        org: "Tidak diketahui",
      };
    }
  }
}

function formatSize(bytes) {
  const tb = bytes / 1024 / 1024 / 1024 / 1024;
  if (tb >= 1) {
    return `${tb.toFixed(2)} TB`;
  }
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  }
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default {
  name: "info",
  description: "Menampilkan informasi bot",
  usage: "/info",
  category: "utility",

  async execute({ ctx, m }) {
    try {
      const message = await ctx.reply("🏓 Mengambil data info...", {
        reply_to_message_id: ctx.message.message_id,
      });

      const botInfo = {
        name: "Kamino Minoa",
        version: "1.0.0",
        developer: "jauhariel.web.id",
      };

      // Informasi IP dan lokasi dari API
      const ipInfo = await getIPInfo();

      // Informasi perangkat
      const totalMemoryBytes = os.totalmem();
      const freeMemoryBytes = os.freemem();
      const usedMemoryBytes = totalMemoryBytes - freeMemoryBytes;

      const totalMemory = formatSize(totalMemoryBytes);
      const usedMemory = formatSize(usedMemoryBytes);
      const freeMemory = formatSize(freeMemoryBytes);

      const uptimeSeconds = os.uptime(); // Uptime dalam detik
      const uptimeDays = Math.floor(uptimeSeconds / 86400); // Hari
      const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600); // Jam
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60); // Menit
      const uptimeSecondsRemaining = uptimeSeconds % 60; // Detik

      // Informasi storage
      let storageInfo = {};
      try {
        if (os.platform() === "win32") {
          // Windows: Gunakan perintah `wmic`
          const output = execSync("wmic logicaldisk get size,freespace,caption")
            .toString()
            .split("\n")
            .filter((line) => line.trim() !== "" && line.includes(":"))
            .map((line) => line.trim().split(/\s+/));

          const [drive, free, total] = output[0]; // Ambil drive pertama
          const used = total - free;

          storageInfo = {
            total: formatSize(total),
            used: formatSize(used),
            free: formatSize(free),
          };
        } else {
          // Linux/macOS: Gunakan perintah `df`
          const output = execSync("df -k /")
            .toString()
            .split("\n")[1]
            .split(/\s+/);

          const total = parseInt(output[1]) * 1024; // Total dalam byte
          const used = parseInt(output[2]) * 1024; // Digunakan dalam byte
          const free = parseInt(output[3]) * 1024; // Tersedia dalam byte

          storageInfo = {
            total: formatSize(total),
            used: formatSize(used),
            free: formatSize(free),
          };
        }
      } catch (err) {
        console.error("Gagal mengambil informasi storage:", err.message);
        storageInfo = {
          total: "Tidak diketahui",
          used: "Tidak diketahui",
          free: "Tidak diketahui",
        };
      }

      let osName = "Tidak diketahui";
      if (os.platform() === "win32") {
        try {
          // Gunakan perintah `wmic` untuk mendapatkan nama Windows
          const output = execSync("wmic os get Caption").toString().split("\n");
          osName = output[1].trim(); // Ambil baris kedua (nama OS)
        } catch (err) {
          console.error("Gagal mendapatkan nama Windows:", err.message);
        }
      } else if (os.platform() === "linux") {
        try {
          // Gunakan file `/etc/os-release` untuk mendapatkan nama distro Linux
          const osRelease = fs.readFileSync("/etc/os-release", "utf-8");
          const match = osRelease.match(/^PRETTY_NAME="(.+)"$/m);
          if (match) {
            osName = match[1];
          }
        } catch (err) {
          console.error("Gagal mendapatkan nama Linux:", err.message);
        }
      }

      const deviceInfo = {
        platform: os.platform(),
        osName: osName,
        arch: os.arch(),
        cpu: os.cpus()[0].model,
        cores: os.cpus().length,
        totalMemory: totalMemory,
        usedMemory: usedMemory,
        freeMemory: freeMemory,
        uptime: `${uptimeDays > 0 ? `${uptimeDays} hari ` : ""}${
          uptimeHours > 0 ? `${uptimeHours} jam ` : ""
        }${
          uptimeMinutes > 0 ? `${uptimeMinutes} menit ` : ""
        }${uptimeSecondsRemaining.toFixed()} detik`,
        storage: storageInfo,
      };

      const hasil = `
🤖 *Informasi Bot*:
- Nama: *${botInfo.name}*
- Versi: *${botInfo.version}*
- Developer: *${botInfo.developer}*

🌐 *Informasi Jaringan*:
- Negara: *${ipInfo.country}*
- Kota: *${ipInfo.city}*
- Provider: *${ipInfo.org}*

💻 *Informasi Perangkat*:
- Platform: *${deviceInfo.platform}*
- OS: *${deviceInfo.osName}*
- Arsitektur: *${deviceInfo.arch}*
- CPU: *${deviceInfo.cpu}*
- Jumlah Core: *${deviceInfo.cores}*

⏳ *Uptime*:
- *${deviceInfo.uptime}*

💾 *RAM*:
- Total: *${deviceInfo.totalMemory}*
- Digunakan: *${deviceInfo.usedMemory}*
- Tersedia: *${deviceInfo.freeMemory}*

📂 *Storage*:
- Total: *${deviceInfo.storage.total}*
- Digunakan: *${deviceInfo.storage.used}*
- Tersedia: *${deviceInfo.storage.free}*
`.trim();

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        null,
        hasil,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Ping command error:", error);
      ctx.reply("❌ Terjadi kesalahan saat ping!", {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  },
};
