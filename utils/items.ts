// BOOTH の商品カード。実際のセレクタはページを見て調整する
export const ITEM_SELECTOR = "[data-product-id]";

export function countItems(root: ParentNode): number {
  return root.querySelectorAll(ITEM_SELECTOR).length;
}
