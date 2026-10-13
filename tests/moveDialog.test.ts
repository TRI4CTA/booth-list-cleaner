import { afterEach, describe, expect, it } from "vitest";
import { confirmMove } from "@/utils/moveDialog";

const params = {
  itemName: "商品タイトル",
  listName: "購入済み",
  others: [{ name: "支援版", price: 1300 }],
};

const open = () => {
  const answer = confirmMove(document, params);
  const dialog = document.querySelector("dialog");
  if (!dialog) throw new Error("dialog not found");
  const click = (label: string) =>
    [...dialog.querySelectorAll("button")].find((b) => b.textContent === label)?.click();
  return { answer, dialog, click };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("confirmMove", () => {
  it("商品名・ほかのバリエーション・移す先を表示する", () => {
    const { dialog } = open();
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain("「商品タイトル」をギフトで受け取りました");
    expect(dialog.querySelector("li")?.textContent).toBe("支援版（¥1,300）");
    expect(dialog.textContent).toContain("「購入済み」に移しますか？");
  });

  it("移すを押すと move", async () => {
    const { answer, click } = open();
    click("「購入済み」に移す");
    expect(await answer).toBe("move");
    expect(document.querySelector("dialog")).toBeNull();
  });

  it("残すを押すと keep", async () => {
    const { answer, click } = open();
    click("好きリストに残す");
    expect(await answer).toBe("keep");
  });

  it("答えずに閉じると null", async () => {
    const { answer, dialog } = open();
    dialog.close();
    expect(await answer).toBeNull();
  });

  it("商品名を HTML として解釈しない", () => {
    confirmMove(document, { ...params, itemName: "<img src=x>" });
    expect(document.querySelector("dialog img")).toBeNull();
  });
});
