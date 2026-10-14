import { describe, expect, it, vi } from "vitest";
import {
  fetchListCode,
  fetchWishedIds,
  getCsrfToken,
  isWishListPage,
  moveToList,
} from "@/utils/wishList";

const response = (status: number) => new Response(null, { status });
const json = (body: unknown) => Response.json(body);

describe("isWishListPage", () => {
  it("好きリストのページを判定する", () => {
    expect(isWishListPage(new URL("https://accounts.booth.pm/wish_lists"))).toBe(true);
    expect(isWishListPage(new URL("https://accounts.booth.pm/wish_lists/abc"))).toBe(true);
    expect(isWishListPage(new URL("https://booth.pm/ja/items/1"))).toBe(false);
  });
});

describe("getCsrfToken", () => {
  it("meta タグからトークンを読む", () => {
    document.head.innerHTML = `<meta name="csrf-token" content="token123">`;
    expect(getCsrfToken(document)).toBe("token123");
  });

  it("なければ null", () => {
    document.head.innerHTML = "";
    expect(getCsrfToken(document)).toBeNull();
  });
});

describe("fetchListCode", () => {
  const lists = [
    { code: "aaaaaaaa", name: "テスト用好きリスト" },
    { code: "bbbbbbbb", name: "購入済み" },
  ];

  it("名前が一致するリストのコードを返す", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json(lists));
    expect(await fetchListCode("購入済み", fetchFn)).toBe("bbbbbbbb");
    expect(fetchFn).toHaveBeenCalledWith("https://accounts.booth.pm/wish_list_names.json", {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  });

  it("見つからなければ null", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json(lists));
    expect(await fetchListCode("購入", fetchFn)).toBeNull();
  });

  it("取得に失敗したら例外", async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(401));
    await expect(fetchListCode("購入済み", fetchFn)).rejects.toThrow("401");
  });
});

describe("fetchWishedIds", () => {
  it("スキしている商品の ID を文字列で返す", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({ item_ids: [1], wishlists_counts: {} }));
    expect(await fetchWishedIds(["1", "2"], fetchFn)).toEqual(["1"]);
    expect(String(fetchFn.mock.calls[0]?.[0])).toBe(
      "https://accounts.booth.pm/wish_lists.json?item_ids%5B%5D=1&item_ids%5B%5D=2",
    );
  });
});

describe("moveToList", () => {
  it("リストのコードだけを指定して PATCH を送る", async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(200));
    expect(await moveToList("123", "bbbbbbbb", "token", fetchFn)).toBe(true);
    expect(fetchFn).toHaveBeenCalledWith("https://booth.pm/items/123/wish_list_items.json", {
      method: "PATCH",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRF-Token": "token",
      },
      body: JSON.stringify({ wish_list_name_codes: ["bbbbbbbb"] }),
    });
  });

  it("失敗したら false", async () => {
    expect(await moveToList("1", "b", "token", vi.fn().mockResolvedValue(response(422)))).toBe(
      false,
    );
    expect(
      await moveToList("1", "b", "token", vi.fn().mockRejectedValue(new Error("network"))),
    ).toBe(false);
  });
});
