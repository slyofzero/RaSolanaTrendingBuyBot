export const userState: { [key: string | number]: string } = {};
export function setUserState(chatId: string | number, state: string) {
  userState[chatId] = state;
}
