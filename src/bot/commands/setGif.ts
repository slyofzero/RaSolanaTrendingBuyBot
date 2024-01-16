import { getDocument, updateDocumentById } from "@/firebase";
import { StoredGroup } from "@/types";
import { log } from "@/utils/handlers";
import { onlyAdmin } from "../utils";
import { Context, HearsContext } from "grammy";

export async function setGifCommand(ctx: HearsContext<Context>) {
  const { id: chatId, type } = ctx.chat;
  const { message, channel_post } = ctx.update;
  const { animation, video } = message || channel_post;
  const videoSource = animation || video;

  let text = "";
  if (type === "private") {
    text = "Only works in groups or channels";
    ctx.reply(text);
    return false;
  }

  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  if (videoSource) {
    const { file_id: gif, mime_type } = videoSource;
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
