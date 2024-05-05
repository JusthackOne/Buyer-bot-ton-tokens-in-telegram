import { GetGroupTokensByGroupId } from "../db/db.token/request.js";

export default async function (ctx, next) {
  try {
    const tokens = await GetGroupTokensByGroupId(
      String(ctx.chat.id)
    );

    if (tokens.length > 0) {
      await ctx.deleteMessage()
      await ctx.replyWithHTML(
        "<b>Please remove the existing token before adding a new one</b>"
      );
      return;
    }

    return next();
  } catch (error) {
    console.error(error);
    return;
  }
}
