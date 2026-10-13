import { getAcceptForm, getGift, isGiftPage, runBeforeAccept } from "@/utils/gift";
import { confirmMove } from "@/utils/moveDialog";
import { addGift, type PendingGift, removeItems } from "@/utils/pendingGifts";
import { pendingGiftsItem, targetListNameItem, updateItem } from "@/utils/storage";
import { fetchItem, otherVariations } from "@/utils/variations";
import {
  fetchListCode,
  fetchWishedIds,
  getCsrfToken,
  isWishListPage,
  moveAllToList,
} from "@/utils/wishList";

// ほかのバリエーションがあるときは、それを欲しいかもしれないのでユーザーに聞く
const decide = async (
  itemId: string,
  gifts: readonly PendingGift[],
  listName: string,
): Promise<"move" | "keep" | null> => {
  const item = await fetchItem(itemId);
  const titles = gifts.filter((g) => g.itemId === itemId).map((g) => g.title);
  const others = otherVariations(item.variations, titles);
  return others.length === 0
    ? "move"
    : confirmMove(document, { itemName: item.name, listName, others });
};

const organizeWishList = async (): Promise<void> => {
  const gifts = await pendingGiftsItem.getValue();
  const listName = await targetListNameItem.getValue();
  const token = getCsrfToken(document);
  if (gifts.length === 0 || !listName || !token) return;

  // リストが見つからないときは、名前が直されたら移せるよう削除予定に残す
  const listCode = await fetchListCode(listName);
  if (!listCode) return;

  const itemIds = [...new Set(gifts.map((g) => g.itemId))];
  const wished = await fetchWishedIds(itemIds);

  const toMove: string[] = [];
  const kept: string[] = [];
  // ダイアログを1つずつ出すため順に処理する
  for (const itemId of wished) {
    const choice = await decide(itemId, gifts, listName).catch(() => null);
    if (choice === "move") toMove.push(itemId);
    if (choice === "keep") kept.push(itemId);
  }

  const moved = await moveAllToList(toMove, listCode, token);
  // スキしていない商品は移す対象がないので、削除予定からも消す
  const notWished = itemIds.filter((id) => !wished.includes(id));
  await updateItem(pendingGiftsItem, removeItems([...moved, ...kept, ...notWished]));
  console.log(`[booth-list-cleaner] moved to "${listName}": ${moved.join(", ")}`);

  // 移せた ID は削除予定から消えているので、再読み込みしても同じ処理を繰り返さない
  if (moved.length > 0) location.reload();
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
