import type { PendingGift } from "@/utils/pendingGifts";

const ACCEPT_FORM_SELECTOR = 'form[action$="/accept"]';
// 受け取り前の画面で /items/ へのリンクはギフト対象の商品だけ
const ITEM_LINK_SELECTOR = 'a[href*="/items/"]';

export const isGiftPage = (url: URL): boolean =>
  url.hostname === "booth.pm" && /\/gifts\/[^/]+\/?$/.test(url.pathname);

export const getAcceptForm = (root: ParentNode): HTMLFormElement | null =>
  root.querySelector<HTMLFormElement>(ACCEPT_FORM_SELECTOR);

// 保存を待たずに遷移すると書き込みが失われうるので、送信を止めて task の後に送信し直す
export const runBeforeAccept = (form: HTMLFormElement, task: () => Promise<void>): void => {
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();
      // 拡張機能の不具合でギフトを受け取れなくならないよう、失敗しても送信する
      await task().catch((error: unknown) => console.error("[booth-list-cleaner]", error));
      form.submit();
    },
    { once: true },
  );
};

export const getGift = (root: ParentNode): PendingGift | null => {
  const link = root.querySelector(ITEM_LINK_SELECTOR);
  const itemId = link?.getAttribute("href")?.match(/\/items\/(\d+)/)?.[1];
  const title = link?.textContent?.trim();
  return itemId && title ? { itemId, title } : null;
};
