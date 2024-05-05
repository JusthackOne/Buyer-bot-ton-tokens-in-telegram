import bot from "../index.js";
import {
    getJettonsInfo,
  getLastPoolsTrades,
  getToken,
  getTokenHolders,
  getTokenPools,
} from "../services/apiService.js";

import { GetPools } from "../db/db.pool/request.js";
import { GetTokensByAddress } from "../db/db.token/request.js";
import {
  createAndCheckLastTrade,
  updateLastTrade,
} from "../db/db.lastTrade/request.js";

import buyedToken from "../utils/buyedToken.js";
import { TradeDto } from "../utils/tradeDto.js";

let taskInProgress = false;
let firstStart = true;

async function task() {
  const pools = await GetPools(); // Все пуллы из доступного лимита

  for (let t in pools) {
    console.log(`Id pool = ${pools[t].id}`);
    const resLastTrades = await getLastPoolsTrades(pools[t].address); // Получение всех трейдов данного пула

    // Получение последнего индекса трейда покупки
    let lastBuyTrade;
    for (let i in resLastTrades) {
      if (resLastTrades[i].attributes.kind === "buy") {
        lastBuyTrade = i;
        break;
      }
    }



    if (resLastTrades === false || lastBuyTrade === undefined) {
      console.log(`Not found ${pools[t].id} buy`);
      continue;
    }

    // Сбор трейда для добавления в бд
    const trade = new TradeDto(resLastTrades, lastBuyTrade, pools, t);

    const isExistLastTrade = await createAndCheckLastTrade(trade);

    let updateRes;
    if (isExistLastTrade === "exist") {
      updateRes = await updateLastTrade(trade, pools[t].token_address); // Получение обновлённого последнего трейда
    } else {
      updateRes = isExistLastTrade;
    }

    const infoPool = (await getTokenPools(pools[t].token_address))[0];
    // console.log(infoPool)

    // Если трейд обновился, то значит нужно отправлять уведомления по группам
    if (updateRes !== "lastVersion") {
      const tokensRes = await GetTokensByAddress(pools[t].token_address); // Получение токенов по адрессу токена
      const jettonInfo = await getJettonsInfo(pools[t].token_address);

      console.log(`Updated last trade ${updateRes.id}`);
      if (tokensRes !== "empty") {
        for (let k in tokensRes) {
          try {
            if (tokensRes[k].image_url.split(" ")[1] === "photo") {
              await bot.telegram.sendPhoto(
                tokensRes[k].group_id,
                tokensRes[k].image_url.split(" ")[0],
                {
                  caption: buyedToken(
                    tokensRes[k],
                    updateRes,
                    infoPool,
                    jettonInfo
                  ),
                  parse_mode: "HTML",
                  link_preview_options: { is_disabled: true },
                }
              );
            } else if (tokensRes[k].image_url.split(" ")[1] === "gif") {
              await bot.telegram.sendAnimation(
                tokensRes[k].group_id,
                tokensRes[k].image_url.split(" ")[0],
                {
                  caption: buyedToken(
                    tokensRes[k],
                    updateRes,
                    infoPool,
                    jettonInfo
                  ),
                  parse_mode: "HTML",
                  link_preview_options: { is_disabled: true },
                }
              );
            } else if (tokensRes[k].image_url.split(" ")[1] === "video") {
              await bot.telegram.sendVideo(
                tokensRes[k].group_id,
                tokensRes[k].image_url.split(" ")[0],
                {
                  caption: buyedToken(
                    tokensRes[k],
                    updateRes,
                    infoPool,
                    jettonInfo
                  ),
                  parse_mode: "HTML",
                  link_preview_options: { is_disabled: true },
                }
              );
            } else {
              await bot.telegram.sendMessage(
                tokensRes[k].group_id,
                buyedToken(tokensRes[k], updateRes, infoPool, jettonInfo),
                {
                  parse_mode: "HTML",
                  link_preview_options: { is_disabled: true },
                }
              );
            }
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  }

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const date = now.toDateString();

  console.log(
    `Всего в пулле: = ${pools.length} пуллов, время = ${
      hours + ":" + minutes + ` ${date}`
    }`
  );
}

export default async function scheduleTask() {
  console.log('Заново запускает sheduleTask');
  global.apiCount = 0;
  if (!taskInProgress) {
    setTimeout(async () => {
      await scheduleTask();
    }, 0.5 * 60 * 1000);
    taskInProgress = true;
    await task();
    taskInProgress = false;
  } else {
    console.log("Previous task is still in progress. Skipping new task.");
    setTimeout(async () => {
      await scheduleTask();
    }, 0.5 * 60 * 1000);
  }
}
