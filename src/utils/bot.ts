import { teleBot } from "..";
import { SendMessagePropsType, SendMessageReturnType } from "@/types";

export function cleanUpBotMessage(text: string) {
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/#/g, "\\#");

  return text;
}

export async function sendMessage(...props: SendMessagePropsType): Promise<SendMessageReturnType> {
  const [chatId, text, other, signal] = props;
  const cleanText = cleanUpBotMessage(text);

  const messageConfig = other || {};
  messageConfig.parse_mode = "MarkdownV2";

  const message = await teleBot.api.sendMessage(chatId, cleanText, messageConfig, signal);
  return message;
}
