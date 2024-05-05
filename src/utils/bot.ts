// import { PairsData, StoredGroup } from "@/types";
// import { errorHandler } from "./handlers";
// import { apiFetcher } from "./api";

// eslint-disable-next-line
export function cleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

// eslint-disable-next-line
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
    .replace(/\*/g, "\\*");

  return text;
}

// export async function botStop(chatId: string | number) {
//   const projectData = (
//     await getRows<StoredGroup>("project_groups", `WHERE chatid = '${chatId}'`)
//   ).at(0);

//   if (projectData) {
//     const tokenData = (
//       await apiFetcher<PairsData>(
//         `https://api.dexscreener.com/latest/dex/tokens/${projectData.token}`
//       )
//     ).data;
//     const pairs = tokenData.pairs.map(({ pairAddress }) => pairAddress);
//     if (!pairs.length) return;

//     const comp = (
//       await getRows<StoredComp>("competitions", `WHERE chatid = '${chatId}'`)
//     ).at(0);

//     await Promise.all([
//       deleteRows("project_groups", `WHERE chatid = '${chatId}'`),
//       deleteRows("competitions", `WHERE chatid = '${chatId}'`),
//       comp
//         ? deleteRows("transactions", `WHERE comp = ${comp?.id}`)
//         : Promise.resolve(),
//     ]);

//     const [webhooks, tokenGroups] = await Promise.all([
//       helius.getAllWebhooks(),
//       getRows("project_groups", `WHERE token = '${projectData.token}'`),
//     ]);

//     if (webhooks.length > 0 && tokenGroups.length === 0) {
//       for (const webhook of webhooks) {
//         const newAddresses = webhook?.accountAddresses.filter(
//           (address) => !pairs.includes(address)
//         );

//         if (webhook) {
//           if (newAddresses.length) {
//             helius
//               .editWebhook(webhook.webhookID, {
//                 accountAddresses: newAddresses,
//               })
//               .then((hook) => {
//                 log(
//                   `Updated webhook ${hook.webhookID} for ${projectData.token}`
//                 );
//               })
//               .catch((e) => errorHandler(e));
//           } else {
//             helius
//               .deleteWebhook(webhook.webhookID)
//               .then(() =>
//                 log(
//                   `Deleted webhook ${webhook.webhookID} for ${projectData.token}`
//                 )
//               )
//               .catch((e) => errorHandler(e));
//           }

//           deleteRows("tracked_tokens", `WHERE token = '${projectData.token}'`);
//         }
//       }
//     }

//     await Promise.all([syncProjectGroups(), syncComp(), syncTrackedTokens()]);
//   }
// }

// // eslint-disable-next-line
// export function botRemovedError(e: any, chatId: string, msg?: string) {
//   const err = e as Error;

//   if (
//     err.message.includes("chat not found") ||
//     err.message.includes("kicked") ||
//     err.message.includes("chat was upgraded") ||
//     err.message.includes("is not a member")
//   ) {
//     botStop(chatId);
//   } else {
//     log(msg || "");
//   }
//   errorHandler(e);
// }
