export default async function (ctx, next) {
  try {
    if (!isEmoji(ctx.message.text)) {
      await ctx.deleteMessage();
      await ctx.replyWithHTML("<b>Send only an emoji</b>");
      return;
    }
    if (ctx.message.text.length !== 2) {
      await ctx.deleteMessage();
      await ctx.replyWithHTML("<b>Send only one emoji character</b>");
      return;
    }

    return next();
  } catch (error) {
    console.error(error);
    return;
  }
}

function isEmoji(symbol) {
  const regex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/;
  return regex.test(symbol);
}
