const decorate = (block) => {
  // Fail Check
  if (!block) return;

  const [iconCol, textCol, urlCol] = block.children ?? [];
  if (!iconCol || !textCol || !urlCol) return;

  const label = textCol?.textContent?.trim();
  const anchor = urlCol.querySelector('a');
  const targetHref = anchor?.href ?? '#';
  const imgEl = iconCol.querySelector('img');

  let imgMarkup = '';

  // Check if imgEl exists before trying to set attributes
  if (imgEl != null) {
    imgEl.setAttribute('aria-hidden', 'true');
    imgMarkup = imgEl?.outerHTML;
  }

  // critical info missing
  if (!(label && targetHref && anchor)) return;

  block.innerHTML = `<a href="${targetHref}" aria-label="${label}">
                      ${imgMarkup}
                      <span>${label}</span>
                    </a>`;
};

export default decorate;
