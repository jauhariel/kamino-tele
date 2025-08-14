export default {
  name: "brat",
  description: "Create brat style text image",
  usage: "/brat <text>",
  category: "media",

  async execute(ctx, args) {
    try {
      // Cek apakah ada text yang diberikan
      if (!args || args.length === 0) {
        return ctx.reply(
          "❌ Harap berikan text untuk dibuat brat style!\n\nContoh: /brat hello world",
          { reply_to_message_id: ctx.message.message_id }
        );
      }

      const text = args.join(" ");

      if (text.length > 50) {
        return ctx.reply("❌ Text terlalu panjang! Maksimal 50 karakter.", {
          reply_to_message_id: ctx.message.message_id,
        });
      }

      // Reply loading message
      const loadingMessage = await ctx.reply("⏳ Membuat brat style image...", {
        reply_to_message_id: ctx.message.message_id,
      });

      // Simulasi pembuatan image (ganti dengan implementasi sebenarnya)
      setTimeout(async () => {
        try {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            loadingMessage.message_id,
            null,
            `✅ Brat style image berhasil dibuat!\n\n📝 Text: "${text}"\n🎨 Style: Brat Green`
          );

          // Di sini Anda bisa menambahkan logic untuk generate image sebenarnya
          // Misalnya menggunakan canvas atau library image manipulation

          await ctx.reply(
            "🖼️ Ini adalah brat style image Anda!\n\n(Implementasi image generation akan ditambahkan)",
            { reply_to_message_id: ctx.message.message_id }
          );
        } catch (error) {
          await ctx.telegram.editMessageText(
            ctx.chat.id,
            loadingMessage.message_id,
            null,
            "❌ Terjadi kesalahan saat membuat image!"
          );
          console.error("Brat generation error:", error);
        }
      }, 1500);
    } catch (error) {
      console.error("Brat command error:", error);
      ctx.reply("❌ Terjadi kesalahan internal!");
    }
  },
};
