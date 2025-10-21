export function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

export function createMockElement(tag = 'div', text = '', testId = '') {
  const el = document.createElement(tag);
  el.innerHTML = text;
  if (testId) {
    el.setAttribute('data-testid', testId);
  }
  return el;
}

export function getByTestId(node, testId) {
  return node.querySelector(`[data-testid="${testId}"]`);
}
