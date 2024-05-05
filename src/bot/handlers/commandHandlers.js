import { Markup } from "telegraf";
import { createAndCheckNewUser } from "../db/db.tgUser/request.js";
import isAdmin from "../helpers/isAdmin.js";
import { GetGroupTokensByGroupId } from "../db/db.token/request.js";
import checkIsTokenExist from "../middlewares/checkIsTokenExist.js";
import checkIsGroup from "../middlewares/checkIsGroup.js";
import getTokenCreatedText from "../utils/getTokenCreatedText.js";
import changeTokenInfoMarkup from "../markups/changeTokenInfoMarkup.js";
import InfoTokenЕxtra from "../utils/InfoTokenExtraDto.js";
import infoTokenText from "../utils/infoTokenText.js";

export default function handlers(bot) {
  // Первый заход в бота
  bot.command("start", async (ctx) => {
    try {
      await ctx.replyWithHTML(
        `⁉️How to set up Persik buy bot: ⁉️\n1. Add @persik_buyer_bot to your group.\n2. Give the bot administrator rights.\n3. Enter "/startbb\n4. Click “Add new token”.\n5. Insert the token address.\n6. Set your own image/gif (optional).\n7. Set your emoticon (optional).\n8. Done\n❗️NOTE: You cannot set up this bot from an anonymous account.\nGood luck!`
      );
    } catch (error) {
      console.error(error);
    }
  });
  // Инструкция
  bot.command("help", async (ctx) => {
    try {
      await ctx.replyWithHTML(
        `⁉️How to set up Persik buy bot: ⁉️\n1. Add @persik_buyer_bot to your group.\n2. Give the bot administrator rights.\n3. Enter "/startbb\n4. Click “Add new token”.\n5. Insert the token address.\n6. Set your own image/gif (optional).\n7. Set your emoticon (optional).\n8. Done\ n❗️NOTE: You cannot set up this bot from an anonymous account.\nGood luck!`
      );
    } catch (error) {
      console.error(error);
    }
  });

  // // Все токены
  // bot.command("allTokens", checkIsGroup, isAdmin, async (ctx) => {
  //   try {
  //     await ctx.deleteMessage()
  //     const tokens = await GetGroupTokensByGroupId(ctx.message.chat.id);

  //     const current = 0;
  //     const pages = Math.ceil(tokens.length / 6);
  //     const buttons = [];

  //     if (tokens.length === 0) {
  //       await ctx.replyWithHTML(`<b>No one token added!</b>`);
  //       return;
  //     }

  //     for (let index = 0; index < 6; index++) {
  //       if (tokens[index]) {
  //         buttons.push(
  //           Markup.button.callback(
  //             tokens[index].name + " - " + tokens[index].symbol,
  //             `infoToken ${tokens[index].id}`
  //           )
  //         );
  //       } else {
  //         buttons.push(Markup.button.callback("-", `none`));
  //       }
  //     }

  //     buttons.push(Markup.button.callback("<<", `prev_page 0`));
  //     buttons.push(Markup.button.callback(`1/${pages}`, `none`));
  //     buttons.push(Markup.button.callback(">>", `next_page 0`));
  //     buttons.push(Markup.button.callback("Close", `close`));

  //     const markup = Markup.inlineKeyboard(buttons, { columns: 3 }).resize();
  //     await ctx.replyWithHTML(`<b>All group tokens:</b>`, { ...markup });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  // Токен группы
  bot.command("settings", checkIsGroup, isAdmin, async (ctx) => {
    try {
      await ctx.deleteMessage();
      const token = (await GetGroupTokensByGroupId(ctx.message.chat.id))[0];

      if (!token) {
        await ctx.replyWithHTML(`<b>No one token added!</b>`);
        return;
      }
      const id = token.id;
      const format = token.image_url.split(" ")[1];
      const media = token.image_url.split(" ")[0];
      const extra = new InfoTokenЕxtra(token, id);

      if (format === "photo") {
        await ctx.replyWithPhoto(media, extra);
      } else if (format === "animation") {
        await ctx.replyWithAnimation(media, extra);
      } else if (format === "video") {
        await ctx.replyWithVideo(media, extra);
      } else {
        await ctx.replyWithHTML(infoTokenText(token), extra);
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Добавить токен
  bot.command(
    "startbb",
    checkIsGroup,
    isAdmin,
    checkIsTokenExist,
    async (ctx) => {
      try {
        const newUser = {
          username: ctx.message.from.username,
          user_id: ctx.message.from.id,
          language_code: ctx.message.from.language_code,
          first_name: ctx.message.from.first_name,
        };

        createAndCheckNewUser(newUser).then(async (res) => {
          if (res === "error") {
            return await ctx.replyWithHTML(`Error! Try restarting the bot!`);
          } else {
            return await ctx.replyWithHTML(
              `Click the button below to register your token with Persik Ton Trending`,

              Markup.inlineKeyboard([
                Markup.button.callback(`Add a new token ❇️`, `addToken`),
              ]).resize()
            );
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  );
}
