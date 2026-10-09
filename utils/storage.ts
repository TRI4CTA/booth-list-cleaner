// 好きリストから削除予定の商品ID（ギフト受け取り画面で追加される）
export const pendingRemovalIdsItem = storage.defineItem<string[]>("local:pendingRemovalIds", {
  fallback: [],
});

type Item<T> = {
  getValue(): Promise<T>;
  setValue(value: T): Promise<void>;
};

// 保存値を読み、update で変換した値を書き戻す
export const updateItem = async <T>(item: Item<T>, update: (value: T) => T): Promise<void> =>
  item.setValue(update(await item.getValue()));
