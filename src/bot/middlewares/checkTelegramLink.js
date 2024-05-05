export default async function (ctx, next) {
  try {
    if (ctx.message.text.length > 32 || ctx.message.text.length < 5) {
      await ctx.deleteMessage();
      await ctx.replyWithHTML("<b>Incorrect telegram group link format</b>");
      return;
    }

    return next();
  } catch (error) {
    console.error(error);
    return;
  }
}
