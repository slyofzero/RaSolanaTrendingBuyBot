import { CallbackQueryContext, CommandContext, Context } from "grammy";
// import { teleBot } from "..";

// export type SendMessagePropsType = Parameters<typeof teleBot.api.sendMessage>;
// export type SendMessageReturnType = ReturnType<typeof teleBot.api.sendMessage>;
export type BotCommandContextType = CommandContext<Context>;
export type BotCallbackContextType = CallbackQueryContext<Context>;
