import { describe, expect, it, vi } from "vitest";
import { fetchItem, otherVariations } from "@/utils/variations";

const normal = { name: "通常版", price: 100 };
const support = { name: "支援版(内容は同じ)", price: 300 };

describe("fetchItem", () => {
  it("商品名とバリエーションの名前・価格だけを取り出す", async () => {
    const body = {
      id: 1,
      name: "商品タイトル",
      variations: [
        { id: 10, ...normal, status: "addable_to_cart" },
        { id: 11, ...support, status: "addable_to_cart" },
      ],
    };
    const fetchFn = vi.fn().mockResolvedValue(Response.json(body));
    expect(await fetchItem("1", fetchFn)).toEqual({
      name: "商品タイトル",
      variations: [normal, support],
    });
    expect(fetchFn).toHaveBeenCalledWith("https://booth.pm/ja/items/1.json", {
      headers: { Accept: "application/json" },
    });
  });

  it("取得に失敗したら例外", async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    await expect(fetchItem("1", fetchFn)).rejects.toThrow("404");
  });
});

describe("otherVariations", () => {
  it("受け取っていないバリエーションを返す", () => {
    expect(otherVariations([normal, support], ["商品タイトル (通常版)"])).toEqual([support]);
  });

  it("括弧を含むバリエーション名も判定できる", () => {
    expect(otherVariations([normal, support], ["商品タイトル (支援版(内容は同じ))"])).toEqual([
      normal,
    ]);
  });

  it("すべて受け取っていれば空", () => {
    const titles = ["商品タイトル (通常版)", "商品タイトル (支援版(内容は同じ))"];
    expect(otherVariations([normal, support], titles)).toEqual([]);
  });

  it("バリエーションが1つなら空", () => {
    expect(otherVariations([normal], ["表記が違う"])).toEqual([]);
  });

  it("受け取ったものが判定できなければすべて返す", () => {
    expect(otherVariations([normal, support], ["表記が違う"])).toEqual([normal, support]);
  });
});
