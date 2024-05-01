import { teleBot } from "..";
import { SendMessagePropsType, SendMessageReturnType } from "@/types";
import { errorHandler, log } from "./handlers";

export function cleanUpBotMessage(text: string | number) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

export function hardCleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/_/g, "\\_")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\+/g, "\\+")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#")
    .replace(/>/g, "\\>")
    .replace(/</g, "\\<")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\*/g, "\\*");

  return text;
}

export async function sendMessage(
  ...props: SendMessagePropsType
): Promise<SendMessageReturnType | false> {
  const [chatId, text, other, signal] = props;
  const cleanText = cleanUpBotMessage(text);

  const messageConfig = other || {};
  messageConfig.parse_mode = "MarkdownV2";

  try {
    const message = await teleBot.api.sendMessage(
      chatId,
      cleanText,
      messageConfig,
      signal
    );
    return message;
  } catch (error) {
    log(text);
    errorHandler(error);
    return false;
  }
}
