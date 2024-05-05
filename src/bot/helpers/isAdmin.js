export default async function (ctx, next) {
  try {
    const chatMember = await ctx.telegram.getChatMember(
      ctx.message.chat.id,
      ctx.message.from.id
    );

    if (chatMember.status === "member") {
      await ctx.deleteMessage()
      return;
    }
    return next();
  } catch (error) {
    console.log(error);
  }
}
