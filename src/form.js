import { THREE } from 'ud-viz';

export class Form {
  constructor(view, formGraph) {
    this.savedValues = [];
    this.view = view;
    this.formGraph = formGraph;
    this.textPanel = null;
    this.currentIndex = -1;
    this.initTextPanel();
    this.initEndButton();
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

  initEndButton() {
    this.endButton = document.createElement('button');
    this.endButton.id = 'end_button';
    this.endButton.innerHTML = 'End';
    this.endButton.style.position = 'absolute';
    this.endButton.style.bottom = '0';
    this.endButton.style.right = '0';
    this.endButton.style.margin = '0';
    this.endButton.style.zIndex = '9';
    this.endButton.style.display = 'none';
    this.endButton.addEventListener(
      'click',
      function () {
        this.saveInputValues(this.currentIndex);
        console.log(this.savedValues);
      }.bind(this)
    );

    document.body.appendChild(this.endButton);
  }

  initPreviousNextButtons() {
    this.previousButton = document.createElement('button');
    this.previousButton.id = 'previous_button';
    this.previousButton.innerHTML = 'Previous';
    this.previousButton.style.position = 'absolute';
    this.previousButton.style.bottom = '0';
    this.previousButton.style.left = '0';
    this.previousButton.style.margin = '0';
    this.previousButton.style.display = 'none';
    this.previousButton.addEventListener(
      'click',
      function () {
        this.goToPreviousNode();
      }.bind(this)
    );

    document.body.appendChild(this.previousButton);

    this.nextButton = document.createElement('button');
    this.nextButton.id = 'Next_button';
    this.nextButton.innerHTML = 'Next';
    this.nextButton.style.position = 'absolute';
    this.nextButton.style.bottom = '0';
    this.nextButton.style.right = '0';
    this.nextButton.style.margin = '0';
    this.nextButton.style.zIndex = '9';
    this.nextButton.style.display = 'block';
    this.nextButton.addEventListener(
      'click',
      function () {
        this.goToNextNode();
      }.bind(this)
    );

    document.body.appendChild(this.nextButton);
  }

  goToPreviousNode() {
    let current = this.formGraph.nodes[this.currentIndex];
    let previous = this.formGraph.nodes[current.previous];
    this.fillWithHtmlFromFile(previous.path, this.textPanel);
    this.travelToPosition(previous, this.view);
    this.currentIndex = current.previous;
    if (this.currentIndex == this.formGraph.startIndex) {
      this.previousButton.style.display = 'none';
    }
    if (this.currentIndex < this.formGraph.endIndex) {
      this.nextButton.style.display = 'block';
      this.endButton.style.display = 'none';
    }
  }

  goToNextNode() {
    this.saveInputValues(this.currentIndex);
    let current = this.formGraph.nodes[this.currentIndex];
    let next = this.formGraph.nodes[current.next];
    this.fillWithHtmlFromFile(next.path, this.textPanel);
    this.travelToPosition(next, this.view);
    this.currentIndex = current.next;
    if (this.currentIndex > this.formGraph.startIndex) {
      this.previousButton.style.display = 'block';
    }
    if (this.currentIndex == this.formGraph.endIndex) {
      this.nextButton.style.display = 'none';
      this.endButton.style.display = 'block';
    }
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
