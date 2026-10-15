import { ownedListNameItem } from "@/utils/storage";

const form = document.querySelector<HTMLFormElement>("#form");
const input = document.querySelector<HTMLInputElement>("#list-name");

if (form && input) {
  input.value = await ownedListNameItem.getValue();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await ownedListNameItem.setValue(input.value.trim());
    window.close();
  });
}
