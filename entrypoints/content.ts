import { getAcceptForm, getGift, isGiftPage, runBeforeAccept } from "@/utils/gift";
import { confirmMove } from "@/utils/moveDialog";
import { addGift, type PendingGift, removeItems } from "@/utils/pendingGifts";
import { pendingGiftsItem, ownedListNameItem, updateItem } from "@/utils/storage";
import { fetchItem, otherVariations } from "@/utils/variations";
import {
  fetchListCode,
  fetchWishedIds,
  getCsrfToken,
  isWishListPage,
  moveToList,
} from "@/utils/wishList";

// ほかのバリエーションがあるときは、それを欲しいかもしれないのでユーザーに聞く
const decide = async (
  itemId: string,
  gifts: readonly PendingGift[],
  ownedListName: string,
): Promise<"move" | "keep" | null> => {
  const item = await fetchItem(itemId);
  const titles = gifts.filter((g) => g.itemId === itemId).map((g) => g.title);
  const others = otherVariations(item.variations, titles);
  return others.length === 0
    ? "move"
    : confirmMove(document, { itemName: item.name, ownedListName, others });
};

const organizeWishList = async (): Promise<void> => {
  const gifts = await pendingGiftsItem.getValue();
  const ownedListName = await ownedListNameItem.getValue();
  const token = getCsrfToken(document);
  if (gifts.length === 0 || !ownedListName || !token) return;

  // リストが見つからないときは、名前が直されたら移せるよう削除予定に残す
  const ownedListCode = await fetchListCode(ownedListName);
  if (!ownedListCode) return;

  const itemIds = [...new Set(gifts.map((g) => g.itemId))];
  const wished = await fetchWishedIds(itemIds);
  // スキしていない商品は移す対象がないので、削除予定からも消す
  await updateItem(pendingGiftsItem, removeItems(itemIds.filter((id) => !wished.includes(id))));

  let movedAny = false;
  // ダイアログを1つずつ出すため順に処理する。途中でタブを閉じても答えた分が失われないよう、
  // 答えるたびに反映する
  for (const itemId of wished) {
    const choice = await decide(itemId, gifts, ownedListName).catch(() => null);
    const done =
      choice === "keep" || (choice === "move" && (await moveToList(itemId, ownedListCode, token)));
    if (done) await updateItem(pendingGiftsItem, removeItems([itemId]));
    if (done && choice === "move") movedAny = true;
  }

  // 移せた ID は削除予定から消えているので、再読み込みしても同じ処理を繰り返さない
  if (movedAny) location.reload();
};

export default defineContentScript({
  matches: ["https://booth.pm/*", "https://*.booth.pm/*"],
  async main() {
    const url = new URL(location.href);
    if (isWishListPage(url)) await organizeWishList();
    if (isGiftPage(url)) {
      const form = getAcceptForm(document);
      const gift = getGift(document);
      // 受け取らずに閉じた商品は好きリストに残したいので、送信時に保存する
      if (form && gift) runBeforeAccept(form, () => updateItem(pendingGiftsItem, addGift(gift)));
    }
  },
});
