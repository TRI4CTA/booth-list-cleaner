import { describe, expect, it, vi } from "vitest";
import { getCsrfToken, isWishListPage, removeAllFromWishList } from "@/utils/wishList";

const response = (status: number) => new Response(null, { status });

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

describe("removeAllFromWishList", () => {
  it("トークン付きで DELETE を送る", async () => {
    const fetchFn = vi.fn().mockResolvedValue(response(200));
    await removeAllFromWishList(["123"], "token", fetchFn);
    expect(fetchFn).toHaveBeenCalledWith("https://booth.pm/items/123/wish_list", {
      method: "DELETE",
      credentials: "include",
      headers: { "X-CSRF-Token": "token" },
    });
  });

  it("成功した ID だけを返す", async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes("/2/")) return response(422);
      if (String(url).includes("/3/")) throw new Error("network");
      return response(200);
    });
    expect(await removeAllFromWishList(["1", "2", "3"], "token", fetchFn)).toEqual(["1"]);
  });
});
