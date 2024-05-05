import formatPrice from "./formatPrice.js";
import formatPriceLower from "./formatPriceLower.js";
import formatWallet from "./formatWallet.js";
import formatingDescription from "./formatingDescription.js";

export default function (token) {
  let message = "";

  let tokenName =
    `<b>` +
    (token?.telegram_handle
      ? `<a href="t.me/${token.telegram_handle}">${token.name}</a>`
      : token.name) +
    ` ${token.symbol}` +
    "</b>";
  message += tokenName;

  let description =
    "\n\n" +
    "<b>Emoji: </b>" +
    (token.description.length > 0 ? token.description : "");
  message += description;

  if (
    token?.websites ||
    token?.discord_url ||
    token?.telegram_handle ||
    token?.twitter_handle
  ) {
    message += "\n\n";
  }

  if (token?.websites) {
    message += `<a href="${token.websites.split(",")[0]}">Site</a>`;
    message += `${
      token?.discord_url || token?.telegram_handle || token?.twitter_handle
        ? " | "
        : ""
    }`;
  }

  if (token?.discord_url) {
    message += `<a href="https://discord.gg/${token.discord_url}">Discord</a>`;
    message += `${
      token?.telegram_handle || token?.twitter_handle ? " | " : ""
    }`;
  }

  if (token?.telegram_handle) {
    message += `<a href="t.me/${token.telegram_handle}">Telegram</a>`;
    message += `${token?.twitter_handle ? " | " : ""}`;
  }

  if (token?.twitter_handle) {
    message += `<a href="www.twitter.com/${token.twitter_handle}">Twitter</a>`;
  }

  return message;
}
