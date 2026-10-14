import { targetListNameItem } from "@/utils/storage";

const form = document.querySelector<HTMLFormElement>("#form");
const input = document.querySelector<HTMLInputElement>("#list-name");

if (form && input) {
  input.value = await targetListNameItem.getValue();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await targetListNameItem.setValue(input.value.trim());
    window.close();
  });
}
