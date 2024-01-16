import { addDocument, getDocument, updateDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";
import { cleanUpBotMessage } from "@/utils/bot";
import { BOT_USERNAME } from "@/utils/env";
import { Address } from "@ton/ton";

export async function startBot(ctx: BotCommandContextType) {
  const { match: jetton } = ctx;
  const { id: chatId, type } = ctx.chat;
  let text = `*Welcome to ${BOT_USERNAME}!!!*\n\n`;

  if (type === "private") {
    text += `@${BOT_USERNAME} needs to be added to your project telegram. By adding @${BOT_USERNAME} to your Base Chain project \\(TON\\), you will be able to view the buys, marketcap and transactions real time.\n\nHype your project with a dedicated Base Chain buy bot today!`;

    ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
  } else {
    if (jetton) {
      text = `This ${type} would now get updates for \`${jetton}\` buys. Each time the bot detects a buy for your jetton, a message would be sent in this group with some data about it.\n\nTo change the jetton address do -\n/start \\<jetton address\\>.`;

      try {
        const newAddress = Address.parse(jetton).toRawString();
        const projectData =
          ((
            await getDocument({
              collectionName: "project_groups",
              queries: [["chatId", "==", String(chatId)]],
            })
          ).at(0) as StoredGroup) || undefined;

        if (projectData) {
          ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
          const updates = { jetton: newAddress };
          updateDocumentById({
            updates,
            collectionName: "project_groups",
            id: projectData.id || "",
          });
        } else {
          ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
          const data: StoredGroup = { chatId: String(chatId), jetton: newAddress };
          addDocument({ data, collectionName: "project_groups" });
        }
      } catch (error) {
        ctx.reply("The jetton address you passed was incorrect.");
      }
    } else {
      text += `To start the buy, add \\@${BOT_USERNAME} as an admin \\(this allows the bot to send messages\\) and then do /start in the below format -\n/start \\<jetton address\\>.`;
      ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
    }
  }
}
