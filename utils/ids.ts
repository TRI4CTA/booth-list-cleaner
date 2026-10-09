// updateItem に渡せるようカリー化している

type IdsUpdater = (ids: readonly string[]) => (current: readonly string[]) => string[];

export const addIds: IdsUpdater = (ids) => (current) => [...new Set([...current, ...ids])];

export const removeIds: IdsUpdater = (ids) => (current) =>
  current.filter((id) => !ids.includes(id));
