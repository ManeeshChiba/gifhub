// Util
const prettyLog = (message) => {
  console.log(
    `%c👾${message}`,
    `color: #e91e63`
  )
};

const state = {
  listening: true,
  visible: false,
  ui: null,
  textarea: null
}

const generateGuid = () => {
  const segment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${segment() + segment()}-${segment()}-${segment()}-${segment()}-${segment() + segment() + segment()}`;
}

const popoverUI = () => {
  const wrapper = document.createElement('section');
  wrapper.id = 'gifhub-ui-wrapper';
  const modal = document.createElement('div');

  const nextButton = document.createElement('button');
  nextButton.classList = 'next-page';

  //
  [1, 2, 3, 4, 5].forEach((iterate) => {
    const el = document.createElement('button');
    const img = document.createElement('img');
    img.src = 'https://via.placeholder.com/125';
    el.classList = `gif gif-${iterate}`;
    el.appendChild(img);
    modal.appendChild(el);
    el.addEventListener('click', () => console.log(`test-${iterate}`));
  });

  modal.appendChild(nextButton);

  modal.id = 'gifhub-ui-modal';
  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);
  state.ui = document.querySelectorAll('#gifhub-ui-wrapper')[0];
}

const checkKeywordMatch = ({ id, string, keyword = 'gif' }) => {
  if (id) {
    const regex = `\/${keyword}(.*)`;
    const matcher = new RegExp(regex, 'gm');
    if (string.match(matcher)) {
      prettyLog(`Keyword ${keyword} match found on ${id}`);
      state.textarea = document.querySelectorAll(`textarea[data-gifhub-id="${id}"]`)[0];
    }
  }
}

prettyLog('GIFHub loaded');

// Find all text areas
const textareas = document.querySelectorAll('textarea');

// Add event listeners
for (let i = 0; i < textareas.length; i++) {
  textareas[i].dataset.gifhubId = generateGuid();
}

// Add event listeners
for (let i = 0; i < textareas.length; i++) {
  textareas[i].addEventListener('keyup', (e) => {
    if (state.listening) {
      const payload = {
        id: textareas[i].dataset.gifhubId || null,
        string: e.target.value,
      }
      checkKeywordMatch(payload);
    }
    if (state.listening && e.keyCode === 13) {
      state.listening = false;
      e.preventDefault();
      state.ui.classList.add('active');
      state.textarea.blur();
    }
  });
}

// Listen for escape
window.addEventListener('keyup', (e) => {
  if (!state.listening && e.keyCode === 27) {
    state.listening = true;
    e.preventDefault();
    state.ui.classList.remove('active');
    state.textarea.focus();
  }
})

// Add hidden UI to page
popoverUI();