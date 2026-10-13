import { getAcceptForm, getGiftItemId, isGiftPage, runBeforeAccept } from "@/utils/gift";
import { addIds, removeIds } from "@/utils/ids";
import { pendingRemovalIdsItem, updateItem } from "@/utils/storage";
import { getCsrfToken, isWishListPage, removeAllFromWishList } from "@/utils/wishList";

const cleanWishList = async (): Promise<void> => {
  const ids = await pendingRemovalIdsItem.getValue();
  const token = getCsrfToken(document);
  if (ids.length === 0 || !token) return;

  const removed = await removeAllFromWishList(ids, token);
  await updateItem(pendingRemovalIdsItem, removeIds(removed));
  console.log(`[booth-list-cleaner] removed from wish list: ${removed.join(", ")}`);

  // 外せた ID は削除予定から消えているので、再読み込みしても同じ削除を繰り返さない
  if (removed.length > 0) location.reload();
};

export default defineContentScript({
  matches: ["https://booth.pm/*", "https://*.booth.pm/*"],
  async main() {
    const url = new URL(location.href);
    if (isWishListPage(url)) await cleanWishList();
    if (isGiftPage(url)) {
      const form = getAcceptForm(document);
      const itemId = getGiftItemId(document);
      // 受け取らずに閉じた商品は好きリストに残したいので、送信時に保存する
      if (form && itemId)
        runBeforeAccept(form, () => updateItem(pendingRemovalIdsItem, addIds([itemId])));
    }
  },
});
