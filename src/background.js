const BROWSER = chrome ? chrome : browser;
const API_KEY = '80ntcYEDztUA09hHSpCej9XfI2GPQ9Xb';

BROWSER.runtime.onMessage.addListener((request) => {
  if (request.id !== BROWSER.runtime.id) return null;
  console.log(request.message.trim());
  getResults(request.message.trim());
});

const sendMessage = (action, message) => {
  const payload = {
    id: BROWSER.runtime.id,
    action,
    message,
  };
  // BROWSER.runtime.sendMessage(payload);
  BROWSER.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    BROWSER.tabs.sendMessage(tabs[0].id, payload);
  });
};

const format = (response) => response.data.map((item) => item.images.original.url);

const getResults = (term) => {
  const path = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${term}&limit=9&rating=PG`;
  fetch(path)
    .then(response => response.json())
    .then(data => {
      sendMessage('FETCH_GIFS_SUCCESS', format(data));
    })
    .catch((error) => { throw new Error(error) });
}