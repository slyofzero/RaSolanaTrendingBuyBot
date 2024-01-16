import { getDocument, removeDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";
import { cleanUpBotMessage } from "@/utils/bot";
import { BOT_USERNAME } from "@/utils/env";
import { onlyAdmin } from "../utils";

export async function stopBot(ctx: BotCommandContextType) {
  const { id: chatId, type } = ctx.chat;
  let text = "";

  if (type === "private") {
    text = `Can only be used in channels, groups, or super groups.`;

    ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
  } else {
    const isAdmin = await onlyAdmin(ctx);
    if (!isAdmin) return false;

    text = `Messages from ${BOT_USERNAME} stopped for this ${type}. Use /start to start.`;

    const projectData =
      ((
        await getDocument({
          collectionName: "project_groups",
          queries: [["chatId", "==", String(chatId)]],
        })
      ).at(0) as StoredGroup) || undefined;

    if (projectData) {
      ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
      removeDocumentById({
        collectionName: "project_groups",
        id: projectData.id || "",
      });
    } else {
      text = `${BOT_USERNAME} isn't running here`;
      ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
    }
  }
}
