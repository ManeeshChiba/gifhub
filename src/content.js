const BROWSER = chrome ? chrome : browser;

// App state
const state = {
  lastActiveId: '',
  query: '',
  resultsGrid: null,
  searchBar: null,
  selected: null,
  ui: null,
};

// Util
const prettyLog = (message) => {
  console.log(
    `%c 👾 ${message}`,
    `color: #e91e63;`
  )
};

const debounce = (method, delay) => {
  let inDebounce;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => method.apply(context, args), delay)
  }
}

const setState = (object) => { // Inventive name, I know
  Object.keys(object).forEach((key) => {
    state[key] = object[key];
  });
}

const generateGuid = () => {
  const segment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${segment() + segment()}-${segment()}-${segment()}-${segment()}-${segment() + segment() + segment()}`;
}

const sendMessage = (action, message) => {
  const payload = {
    id: BROWSER.runtime.id,
    action,
    message,
  };
  BROWSER.runtime.sendMessage(payload);
};

BROWSER.runtime.onMessage.addListener((request) => {
  if (request.id !== BROWSER.runtime.id) return null;
  if (request.action === 'FETCH_GIFS_SUCCESS') {
    populateSearchResults(request.message);
  }
  if (request.action === 'LOAD_GIFHUB') {
    addButtonsToValidForms();
  }
});

/**
 * UI Events and tracking
 */
const openUi = () => {
  state.ui.classList.add('active');
  document.body.style.overflow = 'hidden';
  state.searchBar.select();
}

const closeUi = () => {
  state.ui.classList.remove('active');
  document.body.style.overflow = 'auto';
}

const placeMarkdown = () => {
  if (!state.selected) return false;
  const url = state.selected.dataset.url;
  const textareas = document.querySelectorAll(`form[data-gifhub-id="${state.lastActiveId}"] textarea`);
  textareas.forEach((textarea) => {
    textarea.value = `${textarea.value} ![](${url})`;
  });
  closeUi();
}

const addButtonEventListeners = () => {
  const allGifhubButtons = document.querySelectorAll('button[data-gifhub-form-id]');
  allGifhubButtons.forEach((button) => button.addEventListener('click', showPopupOnButtonClick));
}

const addButtonsToValidForms = () => {
  const addlineButtons = document.querySelectorAll('*[aria-label="Add line comment"]');
  addlineButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        addButtonEventListeners();
      }, 10);
    });
  });
  

  // Find all forms with toolbars
  const forms = document.querySelectorAll('.application-main form'); // Node list
  for (let i = 0; i < forms.length; i++) {
    if (forms[i].querySelectorAll('markdown-toolbar').length > 0) {
      const id = generateGuid();
      if (!forms[i].dataset.gifhubEnabled || forms[i].dataset.gifhubEnabled === 'false') {
        forms[i].dataset.gifhubId = id;
        forms[i].dataset.gifhubEnabled = 'true';
        // Add button to toolbar
        // We want to place this next to link GUI
        const toolGroups = forms[i].querySelectorAll('markdown-toolbar .d-inline-block.mr-3');
        toolGroups.forEach((group) => {
          group.childNodes.forEach((tool) => {
            const ariaLabel = tool.ariaLabel ? tool.getAttribute('aria-label') : '';
            if (ariaLabel.includes('link')) { // Smelly
              group.appendChild(createGifButton(id));
            }
          });
        });
      }
    }
  }
}

// Listen for escape
window.addEventListener('keyup', (e) => {
  if (e.keyCode === 27) {
    e.preventDefault();
    closeUi();
  }
});

const showPopupOnButtonClick = (event) => {
  event.preventDefault();
  const id = event.target.dataset.gifhubFormId;
  setState({ lastActiveId: id });
  openUi();
  state.searchBar.focus();
}

const addTextInputListener = () => {
  state.searchBar.addEventListener('keyup', debounce((event) => {
    setState({ query: event.target.value });
    sendMessage('FETCH_GIFS', state.query);
    prettyLog(`Requested gifs for term ${state.query}`);
  }, 1000));
};


/**
 * UI Creation 
 */
const createGifButton = (id) => {
  const addGif = document.createElement('button');
  addGif.type = 'button';
  addGif.classList.add('add-gif-button', 'tooltipped');
  addGif.setAttribute('aria-label', 'Add a gif');
  addGif.setAttribute('role', 'button');
  addGif.dataset.gifhubFormId = id;
  const image = document.createElement('img');
  var imgSrc = chrome.extension.getURL("assets/logo.svg");
  image.src = imgSrc;
  image.dataset.gifhubFormId = id;
  addGif.appendChild(image);
  addGif.addEventListener('click', showPopupOnButtonClick);
  return addGif;
}

const populateSearchResults = (resultArray) => {
  if (state.resultsGrid) {
    state.resultsGrid.innerHTML = '';
  }
  resultArray.forEach((iterate) => {
    const el = document.createElement('button');
    const img = document.createElement('img');
    el.dataset.url = iterate;
    img.src = iterate;
    el.classList = `gif`;
    el.appendChild(img);
    state.resultsGrid.appendChild(el);
    el.addEventListener('click', (e) => {
      setState({ selected: el });
      placeMarkdown();
    });
  });
}

const popoverUI = () => {
  const wrapper = document.createElement('section');
  wrapper.id = 'gifhub-ui-wrapper';
  const modal = document.createElement('div');
  modal.id = 'gifhub-ui-modal';

  const searchHeader = document.createElement('div');
  searchHeader.id = 'gifhub-ui-searchbar';

  const searchbar = document.createElement('input');
  searchbar.id = 'gifhub-ui-search-input'
  searchbar.setAttribute('type', 'text');
  searchbar.setAttribute('placeholder', 'Search for a GIF');

  searchHeader.appendChild(searchbar);

  const searchResults = document.createElement('div');
  searchResults.id = 'gifhub-ui-results';

  setState({
    searchBar: searchbar,
    resultsGrid: searchResults
  });

  modal.appendChild(searchHeader);
  modal.appendChild(searchResults);
  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);

  wrapper.addEventListener('click', closeUi);

  setState({
    ui: document.querySelectorAll('#gifhub-ui-wrapper')[0]
  });
}

popoverUI(); // Add hidden UI to page
addTextInputListener();
prettyLog('GIFHub loaded');