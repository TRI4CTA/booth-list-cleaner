import { describe, expect, it } from "vitest";
import { countItems } from "@/utils/items";

describe("countItems", () => {
  it("商品カードの数を数える", () => {
    document.body.innerHTML = `
      <li data-product-id="1"></li>
      <li data-product-id="2"></li>
      <li></li>`;
    expect(countItems(document)).toBe(2);
  });
});
