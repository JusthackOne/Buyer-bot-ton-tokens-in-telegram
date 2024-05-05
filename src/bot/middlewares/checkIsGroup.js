export default async function (ctx, next) {
  try {
    if (ctx.chat.type === "private") {
        await ctx.deleteMessage()
      await ctx.replyWithHTML("This command is only available in groups");
      return;
    }
   
    return next();
  } catch (error) {
    console.error(error);
    return;
  }
}
