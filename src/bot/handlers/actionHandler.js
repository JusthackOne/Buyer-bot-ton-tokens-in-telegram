import { Stage } from "telegraf/scenes";
import isAdmin from "../helpers/isAdmin.js";
import isAdminAction from "../helpers/isAdminAction.js";
import {
  DeleteTokenByIdAndGroupId,
  GetGroupTokensByGroupId,
  GetTokenById,
} from "../db/db.token/request.js";
import getTokenCreatedText from "../utils/getTokenCreatedText.js";
import changeTokenInfoMarkup from "../markups/changeTokenInfoMarkup.js";
import { Markup } from "telegraf";

export default function handler(bot) {
  // bot.action("deleteMsg", async (ctx) => {
  //   await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
  // });

  bot.action("addToken", isAdminAction, Stage.enter("AddToken"));
  // change token photo
  bot.action(/changePhoto/, isAdminAction, async (ctx) => {
    const id = ctx.callbackQuery.data.replace("changePhoto ", "");

    await ctx.scene.enter("ChangePhoto", {
      id: id,
    });

    await ctx.answerCbQuery();
  });

  // change description
  bot.action(/changeDescription/, isAdminAction, async (ctx) => {
    const id = ctx.callbackQuery.data.replace("changeDescription ", "");

    await ctx.scene.enter("ChangeDescription", {
      id: id,
    });

    await ctx.answerCbQuery();
  });

  // Получение информации определённого токена
  bot.action(/infoToken/, isAdminAction, async (ctx) => {
    const id = ctx.callbackQuery.data.replace("infoToken ", "");

    const token = await GetTokenById(id);

    const format = token.image_url.split(" ")[1];

    if (format === "photo") {
      await ctx.replyWithPhoto(token.image_url.split(" ")[0], {
        caption: getTokenCreatedText(token),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...changeTokenInfoMarkup(id),
      });
    } else if (format === "animation") {
      await ctx.replyWithAnimation(token.image_url.split(" ")[0], {
        caption: getTokenCreatedText(token),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...changeTokenInfoMarkup(id),
      });
    } else if (format === "video") {
      await ctx.replyWithVideo(token.image_url.split(" ")[0], {
        caption: getTokenCreatedText(token),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...changeTokenInfoMarkup(id),
      });
    } else {
      await ctx.replyWithHTML(getTokenCreatedText(token), {
        link_preview_options: { is_disabled: true },
        ...changeTokenInfoMarkup(id),
      });
    }
    await ctx.answerCbQuery();
  });
  // Получение информации определённого токена
  bot.action(/next_page/, isAdminAction, async (ctx) => {
    try {
      const current =
        Number(ctx.callbackQuery.data.replace("next_page ", "")) + 1;
      const tokens = await GetGroupTokensByGroupId(
        ctx.callbackQuery.message.chat.id
      );
      const pages = Math.ceil(tokens.length / 6);

      if (current === pages) {
        return await ctx.answerCbQuery();
      }

      const buttons = [];

      for (let index = current * 6; index < current * 6 + 6; index++) {
        if (tokens[index]) {
          buttons.push(
            Markup.button.callback(
              tokens[index].name + " - " + tokens[index].symbol,
              `token ${tokens[index].id}`
            )
          );
        } else {
          buttons.push(Markup.button.callback("-", `none`));
        }
      }

      buttons.push(Markup.button.callback("<<", `prev_page ${current}`));
      buttons.push(Markup.button.callback(`${current + 1}/${pages}`, `none`));
      buttons.push(Markup.button.callback(">>", `next_page ${current}`));
      buttons.push(Markup.button.callback("Close", `close`));

      const markup = Markup.inlineKeyboard(buttons, { columns: 3 }).resize();
      await ctx.editMessageText(`<b>All group tokens:</b>`, {
        ...markup,
        parse_mode: "HTML",
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error(error);
    }
  });

  bot.action(/prev_page/, isAdminAction, async (ctx) => {
    try {
      const current =
        Number(ctx.callbackQuery.data.replace("prev_page ", "")) - 1;
      const tokens = await GetGroupTokensByGroupId(
        ctx.callbackQuery.message.chat.id
      );
      const pages = Math.ceil(tokens.length / 6);

      if (current < 0) {
        return await ctx.answerCbQuery();
      }

      const buttons = [];

      for (let index = current * 6; index < current * 6 + 6; index++) {
        if (tokens[index]) {
          buttons.push(
            Markup.button.callback(
              tokens[index].name + " - " + tokens[index].symbol,
              `token ${tokens[index].id}`
            )
          );
        } else {
          buttons.push(Markup.button.callback("-", `none`));
        }
      }

      buttons.push(Markup.button.callback("<<", `prev_page ${current}`));
      buttons.push(Markup.button.callback(`${current + 1}/${pages}`, `none`));
      buttons.push(Markup.button.callback(">>", `next_page ${current}`));
      buttons.push(Markup.button.callback("Close", `close`));

      const markup = Markup.inlineKeyboard(buttons, { columns: 3 }).resize();
      await ctx.editMessageText(`<b>All group tokens:</b>`, {
        ...markup,
        parse_mode: "HTML",
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error(error);
    }
  });

  // Получение информации определённого токена
  bot.action("none", isAdminAction, async (ctx) => {
    try {
      await ctx.answerCbQuery();
    } catch (error) {
      console.error(error);
    }
  });

  // Закрыть с токенами
  bot.action("close", isAdminAction, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.telegram.deleteMessage(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id
      );
    } catch (error) {
      console.error(error);
    }
  });

  // close token
  bot.action("closeToken", isAdminAction, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      await ctx.telegram.deleteMessage(
        ctx.callbackQuery.message.chat.id,
        ctx.callbackQuery.message.message_id
      );
    } catch (error) {
      console.error(error);
    }
  });

  bot.action(/deleteToken/, isAdminAction, async (ctx) => {
    try {
      const id = ctx.callbackQuery.data.replace("deleteToken ", "");

      const res = await DeleteTokenByIdAndGroupId(
        id,
        ctx.callbackQuery.message.chat.id
      );

      if (res) {
        await ctx.deleteMessage();

        await ctx.replyWithHTML(
          "<b>Token successfully deleted from this group</b>"
        );
      }
      await ctx.answerCbQuery();
    } catch (error) {
      console.error(error);
    }
  });

  // change telegram_handle
  bot.action(/changeTelegram/, isAdminAction, async (ctx) => {
    const id = ctx.callbackQuery.data.replace("changeTelegram ", "");

    await ctx.scene.enter("ChangeTelegram", {
      id: id,
    });

    await ctx.answerCbQuery();
  });
}
