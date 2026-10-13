import type { Variation } from "@/utils/variations";

type Choice = "move" | "keep";

type Params = { itemName: string; listName: string; others: readonly Variation[] };

const element = <K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  text = "",
): HTMLElementTagNameMap[K] => {
  const el = doc.createElement(tag);
  el.textContent = text;
  return el;
};

const button = (doc: Document, text: string, onClick: () => void): HTMLButtonElement => {
  const el = element(doc, "button", text);
  el.type = "button";
  el.addEventListener("click", onClick);
  return el;
};

// 商品名などはショップが付けた文字列なので、innerHTML を使わず textContent で入れる
const build = (doc: Document, { itemName, listName, others }: Params): HTMLDialogElement => {
  const dialog = element(doc, "dialog");
  dialog.style.cssText = "max-width: 480px; padding: 24px; border-radius: 16px; line-height: 1.6;";

  const list = element(doc, "ul");
  list.append(
    ...others.map((v) => element(doc, "li", `${v.name}（¥${v.price.toLocaleString("ja-JP")}）`)),
  );

  const buttons = element(doc, "div");
  buttons.style.cssText = "display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;";
  buttons.append(
    button(doc, "好きリストに残す", () => dialog.close("keep")),
    button(doc, `「${listName}」に移す`, () => dialog.close("move")),
  );

  dialog.append(
    element(doc, "h2", `「${itemName}」をギフトで受け取りました`),
    element(doc, "p", "この商品にはほかにも次のバリエーションがあります。"),
    list,
    element(doc, "p", `「${listName}」に移しますか？`),
    buttons,
  );
  return dialog;
};

// 答えずに閉じたときは null。次に好きリストを開いたときにもう一度聞く
export const confirmMove = (doc: Document, params: Params): Promise<Choice | null> =>
  new Promise((resolve) => {
    const dialog = build(doc, params);
    dialog.addEventListener("close", () => {
      dialog.remove();
      const value = dialog.returnValue;
      resolve(value === "move" || value === "keep" ? value : null);
    });
    doc.body.append(dialog);
    dialog.showModal();
  });
