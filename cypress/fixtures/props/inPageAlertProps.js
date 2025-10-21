export const alertPropValues = {
  hyperLinkText: 'This is a 🔗 Hyperlink Text',
  urlLink: 'https://www.qantas.com',
};

const input = (alertType) => {
  let intro = '';
  if (alertType === 'alert') {
    intro = 'This is an ⚠️ alert';
  } else {
    intro = 'This is an ℹ️ information alert';
  }
  return `
<p><strong>${intro}</strong></p>
<p><a class="button" title="This is a 🔗 Hyperlink Text&nbsp;" href="${alertPropValues.urlLink}">${alertPropValues.hyperLinkText}&nbsp;</a></p>
<p>&nbsp;</p>`;
};

export const information = {
  alertType: 'information',
  alertText: input('information'),
  captionText: 'Informational caption',
};

export const alert = {
  alertType: 'alert',
  alertText: input('alert'),
  captionText: 'Alert caption',
};
