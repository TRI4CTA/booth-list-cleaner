import { targetListNameItem } from "@/utils/storage";

const form = document.querySelector<HTMLFormElement>("#form");
const input = document.querySelector<HTMLInputElement>("#list-name");
const status = document.querySelector<HTMLParagraphElement>("#status");

if (form && input && status) {
  input.value = await targetListNameItem.getValue();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await targetListNameItem.setValue(input.value.trim());
    status.textContent = "保存しました";
  });
}
