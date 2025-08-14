export default {
  name: "ping",
  description: "Check bot response time",
  usage: "/ping",
  category: "utility",

  async execute(ctx) {
    try {
      const start = Date.now();
      const message = await ctx.reply("🏓 Pinging...");
      const end = Date.now();

      await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        null,
        `🏓 **Pong!**\n\n⏱️ Response time: ${end - start}ms`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Ping command error:", error);
      ctx.reply("❌ Terjadi kesalahan saat ping!");
    }
  },
};
