import { AdvertisementUserState, ToTrendUserState } from "@/types/userState";

export const userState: { [key: string]: string } = {};
export const trendingState: { [key: string]: ToTrendUserState } = {};
export const advertisementState: { [key: string]: AdvertisementUserState } = {};

export function setUserState(chatId: string | number, state: string) {
  userState[chatId] = state;
}
