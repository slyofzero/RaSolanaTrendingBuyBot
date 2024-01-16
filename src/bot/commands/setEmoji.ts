import { getDocument, updateDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";

export async function setEmoji(ctx: BotCommandContextType) {
  const { match: emoji } = ctx;
  const { id: chatId, type } = ctx.chat;

  if (type === "private") return false;

  let text = "";

  if (!emoji) {
    text =
      "Your custom emoji would replace 🟢 in the messages. To set it do - /set_emoji \\<emoji\\>";
  } else {
    const group =
      ((
        await getDocument({
          collectionName: "project_groups",
          queries: [["chatId", "==", String(chatId)]],
        })
      ).at(0) as StoredGroup) || undefined;

    if (group && group.id) {
      await updateDocumentById({
        id: group.id,
        collectionName: "project_groups",
        updates: { emoji: emoji },
      });
    }
  }

  ctx.reply(text, { parse_mode: "MarkdownV2" });
}
