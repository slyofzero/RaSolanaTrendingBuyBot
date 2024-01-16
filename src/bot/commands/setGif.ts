import { getDocument, updateDocumentById } from "@/firebase";
import { BotCommandContextType, StoredGroup } from "@/types";
import { log } from "@/utils/handlers";
import { onlyAdmin } from "../utils";

export async function setGifCommand(ctx: BotCommandContextType) {
  const { id: chatId, type } = ctx.chat;

  let text = "";
  if (type === "private") {
    text = "Only works in groups or channels";
    ctx.reply(text);
    return false;
  }

  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  const animation = ctx.update.channel_post?.reply_to_message?.animation;

  if (animation) {
    const { file_id: gif, mime_type } = animation;
    const isValidMimeType = mime_type?.includes("video") || mime_type?.includes("gif");

    if (isValidMimeType) {
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
          updates: { gif: gif },
        });

        log(`Set GIF added ${gif} for ${chatId}`);
        text = `New GIF set`;
      }
    } else {
      text = "Invalid GIF, try some other one";
    }
  } else {
    text = "Invalid GIF, try some other one";
  }

  ctx.reply(text);
}
