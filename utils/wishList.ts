const CSRF_TOKEN_SELECTOR = 'meta[name="csrf-token"]';

export const isWishListPage = (url: URL): boolean =>
  url.hostname === "accounts.booth.pm" && url.pathname.startsWith("/wish_lists");

const wishListItemUrl = (itemId: string): string => `https://booth.pm/items/${itemId}/wish_list`;

export const getCsrfToken = (root: ParentNode): string | null =>
  root.querySelector<HTMLMetaElement>(CSRF_TOKEN_SELECTOR)?.content ?? null;

// すでに外れている商品でも成功（200）になる
const removeFromWishList = async (
  itemId: string,
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> => {
  const res = await fetchFn(wishListItemUrl(itemId), {
    method: "DELETE",
    credentials: "include",
    headers: { "X-CSRF-Token": token },
  });
  return res.ok;
};

export const removeAllFromWishList = async (
  itemIds: readonly string[],
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<string[]> => {
  const results = await Promise.all(
    itemIds.map((id) => removeFromWishList(id, token, fetchFn).catch(() => false)),
  );
  return itemIds.filter((_, i) => results[i]);
};
