// title はギフト画面の表記のまま。受け取ったバリエーションの判定に使う
export type PendingGift = { itemId: string; title: string };

type GiftsUpdater = (current: readonly PendingGift[]) => PendingGift[];

// updateItem に渡せるようカリー化している
export const addGift =
  (gift: PendingGift): GiftsUpdater =>
  (current) =>
    current.some((g) => g.itemId === gift.itemId && g.title === gift.title)
      ? [...current]
      : [...current, gift];

export const removeItems =
  (itemIds: readonly string[]): GiftsUpdater =>
  (current) =>
    current.filter((g) => !itemIds.includes(g.itemId));
