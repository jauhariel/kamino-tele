import { fbdl } from "ruhend-scraper";
import axios from "axios";

export default {
  name: "fb",
  description: "Mendownload video Facebook",
  usage: "/fb link",
  category: "downloader",

  async execute(ctx, args) {
    try {
      // Cek apakah ada URL yang diberikan
      if (!args || args.length === 0) {
        return ctx.reply(
          "❌ Harap berikan link Facebook!\n\n/fb linknya\nContoh: /fb https://facebook.com/...",
          { reply_to_message_id: ctx.message.message_id }
        );
      }

      const url = args[0];

      // Validasi URL Facebook sederhana
      const urlRegex =
        /^(https?:\/\/)?(www\.|web\.)?(facebook\.com|fb\.watch)\/.+$/;
      if (!urlRegex.test(url))
        return ctx.reply(
          "❌ Link harus dari Facebook!\n\n/fb linknya\nContoh: /fb https://facebook.com/...",
          {
            reply_to_message_id: ctx.message.message_id,
          }
        );

      // Reply loading message
      const loadingMessage = await ctx.reply(
        "⏳ Sedang memproses video Facebook...",
        { reply_to_message_id: ctx.message.message_id }
      );

      try {
        let hasil = await fbdl(url);

        if (!hasil.data || hasil.data.length === 0) {
          throw new Error("Tidak dapat menemukan video yang diinginkan.");
        }

        let videoUrl = null;

        for (let video of hasil.data) {
          if (video.resolution === "720p (HD)") {
            videoUrl = video.url;
            break;
          } else if (video.resolution === "360p (SD)") {
            videoUrl = video.url;
          }
        }

        // Validasi apakah videoUrl berhasil didapat
        if (!videoUrl) {
          throw new Error(
            "Tidak dapat menemukan video dengan kualitas yang sesuai."
          );
        }

        // Update loading message
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          "� Mendownload video..."
        );

        // Download video dengan headers yang sesuai
        const response = await axios({
          method: "GET",
          url: videoUrl,
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "TelegramBot (like TwitterBot)",
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
          },
          timeout: 60000, // 1 menit timeout
        });

        // Get video buffer
        const videoBuffer = Buffer.from(response.data);

        // Update loading message
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          "📤 Mengirim video..."
        );

        // Kirim video sebagai document dengan buffer
        await ctx.replyWithVideo(
          { source: videoBuffer, filename: `facebook_video_${Date.now()}.mp4` },
          {
            caption: `📹 *Video Facebook*\n\n🔗 *Link:* ${url}\n📊 *Resolusi:* ${
              hasil.data.find((v) => v.url === videoUrl)?.resolution ||
              "Unknown"
            }\n\n_Diunduh oleh Kamino Bot_`,
            parse_mode: "Markdown",
            reply_to_message_id: ctx.message.message_id,
          }
        );

        // Hapus loading message setelah berhasil
        await ctx.telegram.deleteMessage(
          ctx.chat.id,
          loadingMessage.message_id
        );
      } catch (error) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          "❌ Terjadi kesalahan saat memproses video!"
        );
        console.error("Facebook download error:", error);
      }
    } catch (error) {
      console.error("Facebook command error:", error);
      ctx.reply("❌ Terjadi kesalahan internal!", {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  },
};
