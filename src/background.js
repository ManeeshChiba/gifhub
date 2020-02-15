const BROWSER = chrome ? chrome : browser;

BROWSER.runtime.onMessage.addListener((request) => {
  if (request.id !== BROWSER.runtime.id) return null;
  console.log(request.message.trim());
});