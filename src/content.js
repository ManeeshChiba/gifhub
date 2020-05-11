const BROWSER = chrome ? chrome : browser;

// Util
const prettyLog = (message) => {
  console.log(
    `%c👾 ${message}`,
    `color: #e91e63`
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

const sendMessage = (action, message) => {
  const payload = {
    id: BROWSER.runtime.id,
    action,
    message,
  };
  BROWSER.runtime.sendMessage(payload);
};

const createGifButton = (id) => {
  const addGif = document.createElement('button');
  addGif.classList.add('add-gif-button', 'tooltipped');
  addGif.setAttribute('aria-label', 'Add a gif');
  addGif.setAttribute('role', 'button');
  addGif.dataset.gifhubFormId = id;
  addGif.appendChild(document.createTextNode(`👾`)); // Add svg here
  return addGif;
}

const state = {
  listening: true,
  visible: false,
  ui: null,
  searchBar: null,
  textarea: null,
  query: ''
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

  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((iterate) => {
    const el = document.createElement('button');
    const img = document.createElement('img');
    // img.src = 'https://via.placeholder.com/125';
    el.classList = `gif gif-${iterate}`;
    el.appendChild(img);
    searchResults.appendChild(el);
    el.addEventListener('click', () => console.log(`test-${iterate}`));
  });

  modal.appendChild(searchHeader);
  modal.appendChild(searchResults);
  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);

  setState({
    ui: document.querySelectorAll('#gifhub-ui-wrapper')[0],
    searchBar: document.querySelectorAll('#gifhub-ui-search-input')[0]
  });
}

// const checkKeywordMatch = ({ id, string, keyword = 'gif' }) => {
//   if (id) {
//     const regex = `\/${keyword}(.*)`;
//     const matcher = new RegExp(regex, 'gm');
//     if (string.match(matcher)) {
//       prettyLog(`Keyword ${keyword} match found on ${id}`);
//       state.textarea = document.querySelectorAll(`textarea[data-gifhub-id="${id}"]`)[0];
//       const value = string.match(matcher)[0].split(`/${keyword}`);
//       value.shift();
//       state.query = value.join(' ');
//     }
//   }
// }

// Find all forms with toolbars
const getEditableForms = () => {
  const forms = document.querySelectorAll('.application-main form'); // Node list
  for (let i = 0; i < forms.length; i++) {
    if (forms[i].querySelectorAll('markdown-toolbar').length > 0) {
      forms[i].dataset.gifhubId = generateGuid();
      forms[i].dataset.gifhubEnabled = 'true';
    }
  }
}

const appendButtonsToForms = () => {
  // Cache all viable forms
  const capturedForms = document.querySelectorAll('[data-gifhub-enabled]');

  // Add button to toolbar
  capturedForms.forEach((form) => {
    const id = form.dataset.gifhubId;
    // We want to place this next to link GUI
    const toolGroups = form.querySelectorAll('markdown-toolbar .d-inline-block.mr-3');
    toolGroups.forEach((group) => {
      group.childNodes.forEach((tool) => {
        const ariaLabel = tool.ariaLabel ? tool.getAttribute('aria-label') : '';
        if (ariaLabel.includes('link')) { // Smelly
          group.appendChild(createGifButton(id));
        }
      });
    })
  });
}

// Add event listeners
// for (let i = 0; i < forms.length; i++) {
//   forms[i].dataset.gifhubId = generateGuid();
// }

// Add event listeners
// for (let i = 0; i < forms.length; i++) {
//   const toolbar = forms[i].querySelectorAll('markdown-toolbar');
//   console.log(toolbar);
// const test = document.createElement('div');
// test.style.background = '#FF0000';
// toolbar.appendChild(test);
// forms[i].addEventListener('focus', () => {
//   forms[i].dataset.gifhubActive = true;
// });
// forms[i].addEventListener('blur', () => {
//   forms[i].dataset.gifhubActive = false;
// });
// }

// for (let i = 0; i < textareas.length; i++) {
//   textareas[i].addEventListener('keyup', (e) => {
//     if (state.listening) {
//       const payload = {
//         id: textareas[i].dataset.gifhubId || null,
//         string: e.target.value,
//       }
//       checkKeywordMatch(payload);
//     }
//     if (state.listening && e.keyCode === 13) {
//       state.listening = false;
//       e.preventDefault();
//       state.ui.classList.add('active');
//       state.textarea.blur();
//       state.firstGif.focus();

//       sendMessage('FETCH_GIFS', state.query);
//     }
//   });
// }

// Listen for escape
window.addEventListener('keyup', (e) => {
  if (e.keyCode === 27) {
    e.preventDefault();
    state.ui.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
})


const TBD = (event) => {
  event.preventDefault();
  const id = event.target.dataset.gifhubFormId;
  setState({ lastActiveId: id });
  state.ui.classList.add('active');
  document.body.style.overflow = 'hidden';
  state.searchBar.focus();
}

const addButtonEventListeners = () => {
  const allGifhubButtons = document.querySelectorAll('button[data-gifhub-form-id]');
  allGifhubButtons.forEach((button) => button.addEventListener('click', TBD));
}

const addTextInputListener = () => {
  state.searchBar.addEventListener('keyup', debounce((event) => {
    setState({ query: event.target.value });
    sendMessage('FETCH_GIFS', state.query);
    prettyLog(`Requested gifs for term ${state.query}`);
  }, 1000));
};

  // Init
  popoverUI(); // Add hidden UI to page
  getEditableForms();
  appendButtonsToForms();
  addButtonEventListeners();
  addTextInputListener();
  prettyLog('GIFHub loaded');