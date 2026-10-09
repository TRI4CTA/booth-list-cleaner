import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { addIds, removeIds } from "@/utils/ids";
import { pendingRemovalIdsItem, updateItem } from "@/utils/storage";

describe("pendingRemovalIdsItem", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("初期値は空配列", async () => {
    expect(await pendingRemovalIdsItem.getValue()).toEqual([]);
  });

  it("updateItem で追加・削除した結果が保存される", async () => {
    await updateItem(pendingRemovalIdsItem, addIds(["1", "2", "3"]));
    await updateItem(pendingRemovalIdsItem, removeIds(["2"]));
    expect(await pendingRemovalIdsItem.getValue()).toEqual(["1", "3"]);
  });
});
