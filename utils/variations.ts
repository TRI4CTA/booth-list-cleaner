export type Variation = { name: string; price: number };

type Item = { name: string; variations: Variation[] };

const itemJsonUrl = (itemId: string): string => `https://booth.pm/ja/items/${itemId}.json`;

export const fetchItem = async (itemId: string, fetchFn: typeof fetch = fetch): Promise<Item> => {
  const res = await fetchFn(itemJsonUrl(itemId), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${itemJsonUrl(itemId)}`);
  const { name, variations } = (await res.json()) as Item;
  return { name, variations: variations.map((v) => ({ name: v.name, price: v.price })) };
};

// ギフト画面の商品名は「商品名 (バリエーション名)」なので、末尾で受け取ったものを判定する。
// 判定できないときは受け取ったものが分からないので、すべてを候補として返す
export const otherVariations = (
  variations: readonly Variation[],
  giftTitles: readonly string[],
): Variation[] =>
  variations.length <= 1
    ? []
    : variations.filter((v) => !giftTitles.some((title) => title.endsWith(`(${v.name})`)));
