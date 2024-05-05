import changeTokenInfoMarkup from "../markups/changeTokenInfoMarkup.js";
import infoTokenText from "./infoTokenText.js";

export default class InfoTokenЕxtra {
  constructor(token, id) {
    const data = {
      caption: infoTokenText(token),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      ...changeTokenInfoMarkup(id),
    };

    return data;
  }
}
