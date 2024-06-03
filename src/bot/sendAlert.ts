import { errorHandler, log } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { teleBot, trendingBuyAlertBots } from "..";
import { TRENDING_CHANNEL_ID } from "@/utils/env";
import { trendingTokens } from "@/vars/trending";
import { getRandomItemFromArray } from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";

export interface BuyData {
  buyer: string;
  amount: number;
  token: string;
}

export async function sendAlert(data: BuyData) {
  try {
    const { buyer, amount, token } = data;
    const tokenData = memoTokenData[token];
    const { symbol } = tokenData.baseToken;

    const groups = projectGroups.filter(
      ({ token: groupToken }) => groupToken === token
    );

    const isTrending = Object.keys(trendingTokens).includes(token);
    const message = `${buyer} bought ${amount} ${symbol}`;
    log(message);

    if (isTrending) {
      const trendingBuyAlertBot = getRandomItemFromArray(trendingBuyAlertBots);
      trendingBuyAlertBot.api
        .sendMessage(TRENDING_CHANNEL_ID || "", message)
        .catch((e) => errorHandler(e));
    }

    for (const group of groups) {
      return teleBot.api
        .sendMessage(group.chatId, message)
        .catch((e) => errorHandler(e));
    }
  } catch (error) {
    errorHandler(error);
  }
}
