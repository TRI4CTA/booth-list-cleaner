// ギフト受け取り画面で追加する
export const pendingRemovalIdsItem = storage.defineItem<string[]>("local:pendingRemovalIds", {
  fallback: [],
});

type Item<T> = {
  getValue(): Promise<T>;
  setValue(value: T): Promise<void>;
};

export const updateItem = async <T>(item: Item<T>, update: (value: T) => T): Promise<void> =>
  item.setValue(update(await item.getValue()));
