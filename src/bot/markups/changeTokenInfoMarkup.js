import { Markup } from "telegraf";

export default function changeTokenInfoMarkup(id) {
  return Markup.inlineKeyboard([
    Markup.button.callback(`Change photo 🏞`, `changePhoto ${id}`),
    Markup.button.callback(`Change description 📝`, `changeDescription ${id}`),
    Markup.button.callback(`deleteToken 🟥`, `deleteToken ${id}`),
    Markup.button.callback(`Close ❌`, `closeToken`),
  ], { columns: 2 }).resize();
}
