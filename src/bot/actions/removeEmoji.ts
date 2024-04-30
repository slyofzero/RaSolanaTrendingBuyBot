import { BotCallbackContextType, StoredGroup } from "@/types";
import { InlineKeyboard } from "grammy";
import { onlyAdmin } from "../utils";
import { getDocument, updateDocumentById } from "@/firebase";
import { log } from "@/utils/handlers";
import { syncProjectGroups } from "@/vars/projectGroups";

export async function removeEmojiCallback(ctx: BotCallbackContextType) {
  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  const callbackData = ctx.update.callback_query.data;
  if (callbackData.includes("confirm") && ctx.chat) {
    const { id: chatId } = ctx.chat;
    const group =
      ((
        await getDocument({
          collectionName: "project_groups",
          queries: [["chatId", "==", String(chatId)]],
        })
      ).at(0) as StoredGroup) || undefined;

    if (group && group.id) {
      let text = "";
      if (group.emoji) {
        await updateDocumentById({
          id: group.id,
          collectionName: "project_groups",
          updates: { emoji: null },
        });

        log(`Emoji reset back to 🟢 for ${chatId}`);
        syncProjectGroups();
        text = "Emoji reset back to 🟢";
      } else {
        text = "You don't have a custom emoji set";
      }
      ctx.reply(text);
    }
  } else {
    const text =
      "Do you want to delete the custom emoji? It will revert back to 🟢.";

    await ctx.editMessageText(text);
    await ctx.editMessageReplyMarkup({
      reply_markup: new InlineKeyboard()
        .text("Yes", "confirm-remove-emoji")
        .text("No")
        .row()
        .text("Main menu", "settings-main-menu")
        .text("Set Emoji", "set-emoji"),
    });
  }
}
