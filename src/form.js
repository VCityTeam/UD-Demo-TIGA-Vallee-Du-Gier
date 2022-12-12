export function fillWithHtmlFromFile(fileName, targetDiv) {
  fetch(fileName)
    .then((response) => response.text())
    .then((text) => (targetDiv.innerHTML = text));
}

export function initTextPanel(formGraph) {
  let textPanel = document.createElement('div');
  textPanel.id = 'text_panel';
  textPanel.style.float = 'left';
  textPanel.style.height = '100%';
  textPanel.style.width = '30%';
  textPanel.style.backgroundColor = 'white';

  const start = formGraph.nodes[formGraph.startIndex];
  fillWithHtmlFromFile(start.path, textPanel);
  document.body.appendChild(textPanel);
}
