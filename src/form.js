let textPanel = null;

export function fillWithHtmlFromFile(fileName, targetDiv) {
  fetch(fileName)
    .then((response) => response.text())
    .then((text) => (targetDiv.innerHTML = text));
}

export function initTextPanel(formGraph) {
  textPanel = document.createElement('div');
  textPanel.id = 'text_panel';
  textPanel.style.float = 'left';
  textPanel.style.height = '100%';
  textPanel.style.width = '30%';
  textPanel.style.backgroundColor = 'white';

  formGraph.currentIndex = formGraph.startIndex;
  const start = formGraph.nodes[formGraph.startIndex];
  fillWithHtmlFromFile(start.path, textPanel);
  document.body.appendChild(textPanel);
}

export function initPreviousNextButtons(formGraph) {
  let previousButton = document.createElement('button');
  previousButton.id = 'previous_button';
  previousButton.innerHTML = 'Previous';
  previousButton.style.position = 'absolute';
  previousButton.style.bottom = '0';
  previousButton.style.left = '0';
  previousButton.style.margin = '0';
  previousButton.addEventListener('click', function () {
    let current = formGraph.nodes[formGraph.currentIndex];
    let previous = formGraph.nodes[current.previous];
    fillWithHtmlFromFile(previous.path, textPanel);
    formGraph.currentIndex = current.previous;
  });

  document.body.appendChild(previousButton);

  let nextButton = document.createElement('button');
  nextButton.id = 'Next_button';
  nextButton.innerHTML = 'Next';
  nextButton.style.position = 'absolute';
  nextButton.style.bottom = '0';
  nextButton.style.right = '0';
  nextButton.style.margin = '0';
  nextButton.style.zIndex = '9';
  nextButton.addEventListener('click', function () {
    let current = formGraph.nodes[formGraph.currentIndex];
    let next = formGraph.nodes[current.next];
    fillWithHtmlFromFile(next.path, textPanel);
    formGraph.currentIndex = current.next;
  });

  document.body.appendChild(nextButton);
}
