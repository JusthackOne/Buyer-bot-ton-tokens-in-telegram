import { Composer, Scenes, Markup } from "telegraf";
import {
  GetTokenById,
  updateImageUrlTokenById,
} from "../db/db.token/request.js";
import infoTokenText from "../utils/infoTokenText.js";
import changeTokenInfoMarkup from "./../markups/changeTokenInfoMarkup.js";

const sendMessage = new Composer();
sendMessage.action(/changePhoto/, async (ctx) => {
  try {
    ctx.wizard.state.text = await GetTokenById(ctx.wizard.state.id);
    ctx.wizard.state.message_id = ctx.callbackQuery.message.message_id;
    ctx.wizard.state.chatId = ctx.callbackQuery.message.chat.id;
    let msg;
    if (
      ctx.callbackQuery.message?.photo ||
      ctx.callbackQuery.message?.video ||
      ctx.callbackQuery.message?.animation
    ) {
      msg = await ctx.editMessageCaption(
        `${infoTokenText(
          ctx.wizard.state.text
        )}\n\nSend the <b>photo</b> you want the token to have`,
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
        `${infoTokenText(
          ctx.wizard.state.text
        )}\n\nSend the <b>photo</b> you want the token to have`,
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
change.on("photo", async (ctx) => {
  try {
    const token = await updateImageUrlTokenById(
      String(ctx.message.photo[ctx.message.photo.length - 1].file_id) +
        " photo",
      Number(ctx.wizard.state.id)
    );

    const media = token.image_url.split(" ")[0];

    await ctx.replyWithPhoto(media, {
      caption: infoTokenText(token),
      link_preview: false,
      ...changeTokenInfoMarkup(ctx.wizard.state.id),
      parse_mode: "HTML",
    });
    for (let i in ctx.wizard.state.messageToDelete) {
      await ctx.deleteMessage(ctx.wizard.state.messageToDelete[i]);
    }
    await ctx.deleteMessage();

    return ctx.scene.leave();
  } catch (error) {
    console.error(error);
  }
});

change.on("animation", async (ctx) => {
  try {
    const token = await updateImageUrlTokenById(
      String(ctx.message.animation.file_id) + " gif",
      Number(ctx.wizard.state.id)
    );
    await ctx.replyWithDocument(token.image_url.split(" ")[0], {
      caption: infoTokenText(token),
      parse_mode: "HTML",
      ...changeTokenInfoMarkup(ctx.wizard.state.id),
      link_preview_options: { is_disabled: true },
    });
    for (let i in ctx.wizard.state.messageToDelete) {
      await ctx.deleteMessage(ctx.wizard.state.messageToDelete[i]);
    }
    await ctx.deleteMessage();

    return ctx.scene.leave();
  } catch (error) {
    console.error(error);
  }
});

change.on("video", async (ctx) => {
  try {
    const res = await updateImageUrlTokenById(
      String(ctx.message.video.file_id) + " video",
      Number(ctx.wizard.state.id)
    );
    await ctx.replyWithVideo(res.image_url.split(" ")[0], {
      caption: infoTokenText(res),
      parse_mode: "HTML",
      ...changeTokenInfoMarkup(ctx.wizard.state.id),
      link_preview_options: { is_disabled: true },
    });
    for (let i in ctx.wizard.state.messageToDelete) {
      await ctx.deleteMessage(ctx.wizard.state.messageToDelete[i]);
    }
    await ctx.deleteMessage();

    return ctx.scene.leave();
  } catch (error) {
    console.error(error);
  }
});

// Отмена
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
        infoTokenText(ctx.wizard.state.text),
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
        infoTokenText(ctx.wizard.state.text),
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

export const ChangePhoto = new Scenes.WizardScene(
  "ChangePhoto", // first argument is Scene_ID, same as for BaseScene
  sendMessage,
  change
);
