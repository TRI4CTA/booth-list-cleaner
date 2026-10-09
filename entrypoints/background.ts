export default defineBackground(() => {
  console.log("[booth-list-cleaner] background started", {
    id: browser.runtime.id,
  });
});
