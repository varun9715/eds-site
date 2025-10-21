const textPropValues = {
  headerOneText: 'My Sample Header1 Text',
  headerThreeText: 'My Sample Header3 Text',
  headerSixText: 'My Sample Header6 Text',
  italicText: 'Italicized Text',
  underlineText: 'Underlined Text',
  superScriptText: 'Superscript Text',
  subsScriptText: 'Subscript Text',
  hyperLinkText: 'This is a Hyperlink Text',
  urlLink: 'www.qantas.com',
};

const inputText = `<p><h1>${textPropValues.headerOneText}</h1></p>
<p><h3>${textPropValues.headerThreeText}</h3></p>
<p><h6>${textPropValues.headerSixText}</h6></p>
<p><em>${textPropValues.italicText}</em></p>
<p><u>${textPropValues.underlineText}</u></p>
<p>This Line has<sup>${textPropValues.superScriptText}</sup></p>
<p>I have got<sub>${textPropValues.subsScriptText}</sub></p>
<p><strong>Bullet Numbers</strong></p>
<ul>
<li>One</li>
<li>Two</li>
</ul>
<p><strong>Line Numbers</strong></p>
<ol>
<li>&nbsp;One Line</li>
<li>Two Lines&nbsp;</li>
</ol>
<p><a class="button" title="This is a Hyperlink Text&nbsp;" href="${textPropValues.urlLink}">${textPropValues.hyperLinkText}&nbsp;</a></p>
<p>&nbsp;</p>`;

export default { textPropValues, inputText };
