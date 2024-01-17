// import { getDocument, updateDocumentById } from "@/firebase";
// import { BotCommandContextType, StoredGroup } from "@/types";
// import { log } from "@/utils/handlers";
// import { onlyAdmin } from "../utils";

// export async function addPromo(ctx: BotCommandContextType) {
//   const { match: promo } = ctx;
//   const { id: chatId, type } = ctx.chat;

//   let text = "";
//   if (type === "private") {
//     text = "Only works in groups or channels";
//     ctx.reply(text);
//     return false;
//   }

//   const isAdmin = await onlyAdmin(ctx);
//   if (!isAdmin) return false;

//   ctx.reply(text);
// }
