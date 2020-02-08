// Util
const prettyLog = (message) => {
  console.log(
    `%c👾${message}`,
    `color: #e91e63`
  )
};

const generateGuid = () => {
  const segment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${segment() + segment()}-${segment()}-${segment()}-${segment()}-${segment() + segment() + segment()}`;
}

prettyLog('GIFHub loaded');

// Find all text areas
const textareas = document.querySelectorAll('textarea');

// Add event listeners
for (let i = 0; i < textareas.length; i++) {
  textareas[i].dataset.gifhubId = generateGuid();
}

const popoverUI = () => {
  const wrapper = document.createElement('section');
  wrapper.id = 'gifhub-ui-wrapper';
  const modal = document.createElement('div');
  const nextButton = document.createElement('button');
  //
  modal.appendChild(document.createElement('span'));
  modal.appendChild(document.createElement('span'));
  modal.appendChild(document.createElement('span'));
  modal.appendChild(document.createElement('span'));
  modal.appendChild(document.createElement('span'));
  modal.appendChild(nextButton);

  modal.id='gifhub-ui-modal';
  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);
}

// Add event listeners
for (let i = 0; i < textareas.length; i++) {
  textareas[i].addEventListener('keyup', (e) => {
    const payload = {
      id: textareas[i].dataset.gifhubId || null,
      string: e.target.value,
    }
    checkKeywordMatch(payload);
  });
}

const checkKeywordMatch = ({ id, string, keyword = 'gif' }) => {
  if (id) {
    const regex = `\/${keyword}(.*)`;
    const matcher = new RegExp(regex,'gm');
    if (string.match(matcher)) {
      prettyLog(`Keyword ${keyword} match found on ${id}`);
    }
  }
}

popoverUI();