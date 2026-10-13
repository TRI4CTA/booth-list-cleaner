import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import { addGift, removeItems } from "@/utils/pendingGifts";
import { pendingGiftsItem, updateItem } from "@/utils/storage";

describe("pendingGiftsItem", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("初期値は空配列", async () => {
    expect(await pendingGiftsItem.getValue()).toEqual([]);
  });

  it("updateItem で追加・削除した結果が保存される", async () => {
    await updateItem(pendingGiftsItem, addGift({ itemId: "1", title: "A (a)" }));
    await updateItem(pendingGiftsItem, addGift({ itemId: "2", title: "B (b)" }));
    await updateItem(pendingGiftsItem, removeItems(["1"]));
    expect(await pendingGiftsItem.getValue()).toEqual([{ itemId: "2", title: "B (b)" }]);
  });
});
