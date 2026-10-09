import { describe, expect, it } from "vitest";
import { addIds, removeIds } from "@/utils/ids";

describe("addIds", () => {
  it("重複せずに追加する", () => {
    expect(addIds(["2", "3"])(["1", "2"])).toEqual(["1", "2", "3"]);
  });

  it("元の配列を変更しない", () => {
    const current = ["1"];
    addIds(["2"])(current);
    expect(current).toEqual(["1"]);
  });
});

describe("removeIds", () => {
  it("指定したIDを取り除く", () => {
    expect(removeIds(["2"])(["1", "2", "3"])).toEqual(["1", "3"]);
  });
});
