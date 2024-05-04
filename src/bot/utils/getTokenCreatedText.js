import formatingDescription from "./formatingDescription.js";

export default function (token) {
  return `🟢 <b>Added new token!</b> 🟢${
    token.description.length > 0
      ? `\n\n` + formatingDescription(token.description)
      : ""
  }\n\n<b>Name:</b> ${token.name}\n<b>Symbol:</b> ${token.symbol}${
    token?.websites ||
    token?.discord_url ||
    token?.telegram_handle ||
    token?.twitter_handle
      ? "\n\n"
      : ""
  }${
    token?.websites
      ? `<a href="${token.websites.split(",")[0]}">Site</a> |`
      : ""
  } ${
    token?.discord_url
      ? `<a href="https://discord.gg/${token.discord_url}">Discord</a> |`
      : ""
  }${
    token?.telegram_handle
      ? `<a href="t.me/${token.telegram_handle}">Telegram</a> |`
      : ""
  } ${
    token?.twitter_handle
      ? `<a href="www.twitter.com/${token.twitter_handle}">Twitter</a>`
      : ""
  }`;
}
