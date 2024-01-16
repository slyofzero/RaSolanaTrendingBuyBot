import { Context } from "grammy";

export async function onlyAdmin(ctx: Context) {
  if (!ctx.chat) {
    return;
  }
  // Channels and private chats are only postable by admins
  if (["channel", "private"].includes(ctx.chat.type)) {
    return true;
  }
  // Anonymous users are always admins
  if (ctx.from?.username === "GroupAnonymousBot") {
    return true;
  }
  // Surely not an admin
  if (!ctx.from?.id) {
    return;
  }
  // Check the member status
  const chatMember = await ctx.getChatMember(ctx.from.id);
  if (["creator", "administrator"].includes(chatMember.status)) {
    return true;
  }
  // Not an admin
  return false;
}
