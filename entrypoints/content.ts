import { countItems } from "@/utils/items";

export default defineContentScript({
  matches: ["https://booth.pm/*", "https://*.booth.pm/*"],
  main() {
    console.log(`[booth-list-cleaner] loaded: ${countItems(document)} items`);
  },
});
