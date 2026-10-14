import { describe, expect, it } from "vitest";
import { addGift, removeItems } from "@/utils/pendingGifts";

const a = { itemId: "1", title: "A (a)" };

describe("addGift", () => {
  it("同じ商品・同じバリエーションは重複させない", () => {
    expect(addGift(a)([a])).toEqual([a]);
  });

  it("同じ商品でもバリエーションが違えば追加する", () => {
    const other = { itemId: "1", title: "A (b)" };
    expect(addGift(other)([a])).toEqual([a, other]);
  });

  it("元の配列を変更しない", () => {
    const current = [a];
    addGift({ itemId: "2", title: "B (b)" })(current);
    expect(current).toEqual([a]);
  });
});

describe("removeItems", () => {
  it("指定した商品のギフトをすべて取り除く", () => {
    const gifts = [a, { itemId: "1", title: "A (b)" }, { itemId: "2", title: "B (b)" }];
    expect(removeItems(["1"])(gifts)).toEqual([{ itemId: "2", title: "B (b)" }]);
  });
});
