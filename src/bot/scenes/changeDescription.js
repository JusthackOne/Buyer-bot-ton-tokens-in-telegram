import { Composer, Markup, Scenes } from "telegraf";

import { message } from "telegraf/filters";
import getTokenCreatedText from "../utils/getTokenCreatedText.js";
import { GetTokenById, updateDescriptionById } from "../db/db.token/request.js";
import changeTokenInfoMarkup from "./../markups/changeTokenInfoMarkup.js";
import formatingDescription from "../utils/formatingDescription.js";

const sendMessage = new Composer();
sendMessage.action(/changeDescription/, async (ctx) => {
  try {
    ctx.wizard.state.text = await GetTokenById(ctx.wizard.state.id);
    ctx.wizard.state.message_id = ctx.callbackQuery.message.message_id;
    ctx.wizard.state.chatId = ctx.callbackQuery.message.chat.id;
    ctx.wizard.state.media = null;
    let msg;

    if (ctx.callbackQuery.message?.photo) {
      ctx.wizard.state.media = "photo";
    } else if (ctx.callbackQuery.message?.animation) {
      ctx.wizard.state.media = "animation";
    } else if (ctx.callbackQuery.message?.video) {
      ctx.wizard.state.media = "video";
    }

    if (ctx.wizard.state.media) {
      msg = await ctx.editMessageCaption(
        `${getTokenCreatedText(
          ctx.wizard.state.text
        )}\n\nSend the <b>description</b> you want the token to have`,
        {
          link_preview_options: { is_disabled: true },
          ...Markup.inlineKeyboard([
            Markup.button.callback(`Cancel ❌`, `cancel`),
          ]).resize(),
          parse_mode: `HTML`,
        }
      );
    } else {
      msg = await ctx.editMessageText(
        `${getTokenCreatedText(
          ctx.wizard.state.text
        )}\n\nSend the <b>description</b> you want the token to have`,
        {
          link_preview_options: { is_disabled: true },
          ...Markup.inlineKeyboard([
            Markup.button.callback(`Cancel ❌`, `cancel`),
          ]).resize(),
          parse_mode: `HTML`,
        }
      );
    }

    ctx.wizard.state.messageToDelete = [];
    ctx.wizard.state.messageToDelete.push(msg.message_id);
    return ctx.wizard.next();
  } catch (error) {
    console.error(error);
  }
});

const change = new Composer();
//Введён текст
change.on(message("text"), async (ctx) => {
  try {
    const token = await updateDescriptionById(
      formatingDescription(ctx.message.text),
      ctx.wizard.state.id
    );

    if (token) {
      if (ctx.wizard.state.media === "photo") {
        await ctx.replyWithPhoto(token.image_url.split(" ")[0], {
          caption: getTokenCreatedText(token),
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
        });
      } else if (ctx.wizard.state.media === "animation") {
        await ctx.replyWithAnimation(token.image_url.split(" ")[0], {
          caption: getTokenCreatedText(token),
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
        });
      } else if (ctx.wizard.state.media === "video") {
        await ctx.replyWithVideo(token.image_url.split(" ")[0], {
          caption: getTokenCreatedText(token),
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
        });
      } else {
        await ctx.replyWithHTML(getTokenCreatedText(token), {
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
        });
      }
    } else {
      await ctx.telegram.editMessageText(
        ctx.wizard.state.chatId,
        ctx.wizard.state.message_id,
        "This token not exist",
        {
          reply_markup: {
            inline_keyboard: [],
          },
        }
      );
    }
    await ctx.deleteMessage();
    for (let i in ctx.wizard.state.messageToDelete) {
      await ctx.deleteMessage(ctx.wizard.state.messageToDelete[i]);
    }
    return ctx.scene.leave();
  } catch (error) {
    console.error(error);
  }
});

change.action("cancel", async (ctx) => {
  try {
    if (
      ctx.callbackQuery.message?.photo ||
      ctx.callbackQuery.message?.video ||
      ctx.callbackQuery.message?.animation
    ) {
      await ctx.telegram.editMessageCaption(
        ctx.wizard.state.chatId,
        ctx.wizard.state.message_id,
        null,
        getTokenCreatedText(ctx.wizard.state.text),
        {
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
          parse_mode: `HTML`,
        }
      );
    } else {
      await ctx.telegram.editMessageText(
        ctx.wizard.state.chatId,
        ctx.wizard.state.message_id,
        null,
        getTokenCreatedText(ctx.wizard.state.text),
        {
          link_preview_options: { is_disabled: true },
          ...changeTokenInfoMarkup(ctx.wizard.state.id),
          parse_mode: `HTML`,
        }
      );
    }
    return ctx.scene.leave();
  } catch (error) {
    console.error(error);
  }
});

export const ChangeDescription = new Scenes.WizardScene(
  "ChangeDescription", // first argument is Scene_ID, same as for BaseScene
  sendMessage,
  change
);
