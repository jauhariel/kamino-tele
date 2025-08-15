import axios from "axios";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import path from "path";
import { uploadFile } from "../../utils/uploader.js";

const streamPipeline = promisify(pipeline);

export default {
  name: "upload",
  description: "Upload a file",
  usage: "/upload",
  category: "utility",

  async execute({ ctx, m, prefix }) {
    try {
      const photo = m.isReply ? m.reply_to_message.photo : m.photo;
      const video = m.isReply ? m.reply_to_message.video : m.video;
      const document = m.isReply ? m.reply_to_message.document : m.document;
      const audio = m.isReply ? m.reply_to_message.audio : m.audio;

      if (!photo && !video && !document && !audio) {
        return ctx.reply(
          `❌ Silakan reply/kirim foto, video, dokumen, atau audio untuk diupload kemudian ketik ${prefix}upload`,
          {
            reply_to_message_id: ctx.message.message_id,
          }
        );
      }

      const fileId =
        (Array.isArray(photo) ? photo[photo.length - 1]?.file_id : undefined) ||
        video?.file_id ||
        audio?.file_id ||
        document?.file_id;

      if (!fileId) {
        return ctx.reply("❌ File ID tidak ditemukan!", {
          reply_to_message_id: ctx.message.message_id,
        });
      }

      const loadingMessage = await ctx.reply("⏳ Mengupload file...", {
        reply_to_message_id: ctx.message.message_id,
      });

      const fileLink = await ctx.telegram.getFileLink(fileId);

      const urlPath = new URL(fileLink.href).pathname;
      const fileExtension = path.extname(urlPath) || ".bin";

      let filePrefix = "file";
      if (photo) filePrefix = "photo";
      else if (video) filePrefix = "video";
      else if (audio) filePrefix = "audio";
      else if (document) filePrefix = "document";

      const fileName = `${filePrefix}_${Date.now()}${fileExtension}`;

      const writer = fs.createWriteStream(`./tmp/${fileName}`);

      const response = await axios({
        method: "GET",
        url: fileLink.href,
        responseType: "stream",
      });

      await streamPipeline(response.data, writer);

      const result = await uploadFile(writer.path);

      if (result.error) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          `❌ Gagal mengupload file: ${result.error}`
        );
      } else {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          `✅ Berhasil mengupload file ke ${result.provider}: ${result.data}`
        );
      }

      fs.unlinkSync(writer.path);
      try {
      } catch (error) {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingMessage.message_id,
          null,
          "❌ Terjadi kesalahan saat mengupload file!"
        );
        console.error("upload file error:", error);
      }
    } catch (error) {
      console.error("upload file error:", error);
      ctx.reply("❌ Terjadi kesalahan internal!");
    }
  },
};
