import { THREE } from 'ud-viz';

export class Form {
  constructor(view, formGraph) {
    this.savedValues = [];
    this.view = view;
    this.formGraph = formGraph;
    this.textPanel = null;
    this.currentIndex = -1;
    this.initTextPanel();
    this.initPreviousNextButtons();
  }

  fillWithHtmlFromFile(fileName, targetDiv) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => (targetDiv.innerHTML = text));
  }

  initTextPanel() {
    this.textPanel = document.createElement('div');
    this.textPanel.id = 'text_panel';
    this.textPanel.style.float = 'left';
    this.textPanel.style.height = '100%';
    this.textPanel.style.width = '30%';
    this.textPanel.style.backgroundColor = 'white';

    this.currentIndex = this.formGraph.startIndex;
    const start = this.formGraph.nodes[this.formGraph.startIndex];
    this.fillWithHtmlFromFile(start.path, this.textPanel);
    this.travelToPosition(start, this.view);
    document.body.appendChild(this.textPanel);
  }

  initPreviousNextButtons() {
    let previousButton = document.createElement('button');
    previousButton.id = 'previous_button';
    previousButton.innerHTML = 'Previous';
    previousButton.style.position = 'absolute';
    previousButton.style.bottom = '0';
    previousButton.style.left = '0';
    previousButton.style.margin = '0';
    previousButton.addEventListener(
      'click',
      function () {
        let current = this.formGraph.nodes[this.currentIndex];
        let previous = this.formGraph.nodes[current.previous];
        this.fillWithHtmlFromFile(previous.path, this.textPanel);
        this.travelToPosition(previous, this.view);
        this.currentIndex = current.previous;
      }.bind(this)
    );

    document.body.appendChild(previousButton);

    let nextButton = document.createElement('button');
    nextButton.id = 'Next_button';
    nextButton.innerHTML = 'Next';
    nextButton.style.position = 'absolute';
    nextButton.style.bottom = '0';
    nextButton.style.right = '0';
    nextButton.style.margin = '0';
    nextButton.style.zIndex = '9';
    nextButton.addEventListener(
      'click',
      function () {
        this.saveInputValues(this.currentIndex);
        let current = this.formGraph.nodes[this.currentIndex];
        let next = this.formGraph.nodes[current.next];
        this.fillWithHtmlFromFile(next.path, this.textPanel);
        this.travelToPosition(next, this.view);
        this.currentIndex = current.next;
      }.bind(this)
    );

    document.body.appendChild(nextButton);
  }

  travelToPosition(graphNode, view) {
    try {
      const newCameraCoordinates = new THREE.Vector3(
        graphNode.position.x,
        graphNode.position.y,
        graphNode.position.z
      );
      const newCameraQuaternion = new THREE.Quaternion(
        graphNode.rotation.x,
        graphNode.rotation.y,
        graphNode.rotation.z,
        graphNode.rotation.w
      );
      view.controls.initiateTravel(
        newCameraCoordinates,
        'auto',
        newCameraQuaternion,
        true
      );
    } catch (error) {
      console.log('No position or rotation');
    }
  }

  saveInputValues(nodeIndex) {
    const formInputs = this.textPanel.querySelectorAll('input, select');
    let values = [];
    formInputs.forEach((input) => {
      let value = '';
      if (input.nodeName == 'INPUT') {
        switch (input.type) {
          case 'text':
            value = input.value;
            break;
          default:
            if (input.checked) {
              value = document.querySelector(
                'label[for=' + input.id + ']'
              ).innerHTML;
            }
        }
      }
      if (input.nodeName == 'SELECT') {
        value = input.options[input.selectedIndex].text;
      }
      values.push(value);
    });
    this.savedValues[nodeIndex] = values;
  }
}
