import { getDocument, updateDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";
import { log } from "@/utils/handlers";

export async function setEmojiCommand(ctx: BotCommandContextType) {
  const { match: emoji } = ctx;
  const { id: chatId, type } = ctx.chat;

  let text = "";
  if (type === "private") text = "Only works in groups or channels";

  if (!emoji) {
    text = "Missing emoji. To set it do - /set_emoji <emoji>";
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

      log(`Set emoji ${emoji} for ${chatId}`);
      text = `New emoji ${emoji} set`;
    }
  }

  ctx.reply(text);
}
