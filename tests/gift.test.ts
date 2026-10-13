import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import giftHtml from "./fixtures/gift.html?raw";
import { getAcceptForm, getGift, isGiftPage, runBeforeAccept } from "@/utils/gift";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isGiftPage", () => {
  it("ギフト受け取り画面を判定する", () => {
    const gift = "https://booth.pm/gifts/00000000-0000-0000-0000-000000000000";
    expect(isGiftPage(new URL(gift))).toBe(true);
    expect(isGiftPage(new URL(`${gift}/accept`))).toBe(false);
    expect(isGiftPage(new URL("https://booth.pm/ja/items/1"))).toBe(false);
  });
});

describe("受け取り前画面", () => {
  beforeEach(() => {
    document.body.innerHTML = giftHtml;
  });

  it("商品IDと表示されている商品名を取得する", () => {
    expect(getGift(document)).toEqual({
      itemId: "1234567",
      title: "商品タイトル (バリエーション名)",
    });
  });

  it("受け取りフォームを取得する", () => {
    expect(getAcceptForm(document)?.textContent).toContain("ギフトを受け取る");
  });
});

describe("runBeforeAccept", () => {
  const setup = (task: () => Promise<void>) => {
    document.body.innerHTML = giftHtml;
    const form = getAcceptForm(document)!;
    const submit = vi.spyOn(form, "submit").mockImplementation(() => {});
    runBeforeAccept(form, task);
    const event = new Event("submit", { cancelable: true });
    form.dispatchEvent(event);
    return { form, submit, event };
  };

  it("送信を止め、task が終わってから送信し直す", async () => {
    let resolve!: () => void;
    const { submit, event } = setup(() => new Promise((r) => (resolve = r)));

    expect(event.defaultPrevented).toBe(true);
    expect(submit).not.toHaveBeenCalled();

    resolve();
    await vi.waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });

  it("task が失敗しても送信する", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { submit } = setup(() => Promise.reject(new Error("storage")));
    await vi.waitFor(() => expect(submit).toHaveBeenCalledOnce());
  });

  it("2回目の送信では task を呼ばない", async () => {
    const task = vi.fn(() => Promise.resolve());
    const { form, submit } = setup(task);
    await vi.waitFor(() => expect(submit).toHaveBeenCalledOnce());

    const second = new Event("submit", { cancelable: true });
    form.dispatchEvent(second);
    expect(second.defaultPrevented).toBe(false);
    expect(task).toHaveBeenCalledOnce();
  });
});

describe("getGift", () => {
  it("商品リンクがなければ null", () => {
    document.body.innerHTML = `<a href="https://example-shop.booth.pm/">shop</a>`;
    expect(getGift(document)).toBeNull();
  });
});
