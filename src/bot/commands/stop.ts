import { addDocument, getDocument, removeDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";
import { cleanUpBotMessage } from "@/utils/bot";
import { BOT_USERNAME } from "@/utils/env";
import { Address } from "@ton/ton";
import { onlyAdmin } from "../utils";

export async function stopBot(ctx: BotCommandContextType) {
  const { match: jetton } = ctx;
  const { id: chatId, type } = ctx.chat;
  let text = "";

  if (type === "private") {
    text = `Can only be used in channels, groups, or super groups.`;

    ctx.reply(cleanUpBotMessage(text), { parse_mode: "MarkdownV2" });
  } else {
    const isAdmin = await onlyAdmin(ctx);
    if (!isAdmin) return false;

    text = `Messages from ${BOT_USERNAME} stopped for this ${type}. Use /start to start.`;

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
        removeDocumentById({
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
  }
}
