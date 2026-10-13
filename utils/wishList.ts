const CSRF_TOKEN_SELECTOR = 'meta[name="csrf-token"]';
const LIST_NAMES_URL = "https://accounts.booth.pm/wish_list_names.json";
const WISHED_URL = "https://accounts.booth.pm/wish_lists.json";

type ListName = { code: string; name: string };

export const isWishListPage = (url: URL): boolean =>
  url.hostname === "accounts.booth.pm" && url.pathname.startsWith("/wish_lists");

const listItemsUrl = (itemId: string): string =>
  `https://booth.pm/items/${itemId}/wish_list_items.json`;

export const getCsrfToken = (root: ParentNode): string | null =>
  root.querySelector<HTMLMetaElement>(CSRF_TOKEN_SELECTOR)?.content ?? null;

const getJson = async <T>(url: string, fetchFn: typeof fetch): Promise<T> => {
  const res = await fetchFn(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
};

export const fetchListCode = async (
  name: string,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> =>
  (await getJson<ListName[]>(LIST_NAMES_URL, fetchFn)).find((list) => list.name === name)?.code ??
  null;

// スキしていない商品はリストに入れられないので、スキしているものだけに絞る
export const fetchWishedIds = async (
  itemIds: readonly string[],
  fetchFn: typeof fetch = fetch,
): Promise<string[]> => {
  const query = new URLSearchParams(itemIds.map((id) => ["item_ids[]", id]));
  const { item_ids } = await getJson<{ item_ids: number[] }>(`${WISHED_URL}?${query}`, fetchFn);
  return item_ids.map(String);
};

// 送ったリストの集合で所属が置き換わるので、他のリストや未分類からは外れる
const moveToList = async (
  itemId: string,
  listCode: string,
  token: string,
  fetchFn: typeof fetch,
): Promise<boolean> => {
  const res = await fetchFn(listItemsUrl(itemId), {
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token": token,
    },
    body: JSON.stringify({ wish_list_name_codes: [listCode] }),
  });
  return res.ok;
};

export const moveAllToList = async (
  itemIds: readonly string[],
  listCode: string,
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<string[]> => {
  const results = await Promise.all(
    itemIds.map((id) => moveToList(id, listCode, token, fetchFn).catch(() => false)),
  );
  return itemIds.filter((_, i) => results[i]);
};
