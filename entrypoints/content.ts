import { removeIds } from "@/utils/ids";
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
    if (isWishListPage(new URL(location.href))) await cleanWishList();
  },
});
