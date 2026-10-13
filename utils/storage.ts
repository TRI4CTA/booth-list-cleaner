import type { PendingGift } from "@/utils/pendingGifts";

// ギフト受け取り画面で追加し、好きリストで移すか残すかが決まったら消す
export const pendingGiftsItem = storage.defineItem<PendingGift[]>("local:pendingGifts", {
  fallback: [],
});

// オプションページで設定する。空のときは何もしない
export const targetListNameItem = storage.defineItem<string>("local:targetListName", {
  fallback: "",
});

type Item<T> = {
  getValue(): Promise<T>;
  setValue(value: T): Promise<void>;
};

export const updateItem = async <T>(item: Item<T>, update: (value: T) => T): Promise<void> =>
  item.setValue(update(await item.getValue()));
