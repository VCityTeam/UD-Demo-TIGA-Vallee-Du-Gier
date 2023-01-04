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

  fillWithHtmlFromFile(fileName) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        document.getElementById('form_container').innerHTML = text;
      });
  }

  fillWithRecapValues(values) {
    const formContainer = document.getElementById('form_container');
    formContainer.innerHTML = '';

    const recapTitle = document.createElement('h1');
    recapTitle.innerHTML =
      'Félicitations, vous avez terminé le parcours ' +
      this.formGraph.name +
      ' !';
    formContainer.appendChild(recapTitle);

    values.forEach((array) => {
      formContainer.appendChild(document.createTextNode(array.join('; ')));
      formContainer.appendChild(document.createElement('br'));
    });

    const restartButton = document.createElement('button');
    restartButton.classList.add('recap-button');
    restartButton.innerHTML = 'Recommencer';
    formContainer.appendChild(restartButton);

    const visitButton = document.createElement('button');
    visitButton.classList.add('recap-button');
    visitButton.innerHTML = 'Visite Libre';
    formContainer.appendChild(visitButton);
  }

  initTextPanel() {
    const textDiv = document.createElement('div');
    textDiv.id = 'text_div';

    this.textPanel = document.createElement('div');
    this.textPanel.id = 'text_panel';

    const formContainer = document.createElement('div');
    formContainer.id = 'form_container';
    this.textPanel.appendChild(formContainer);

    this.currentIndex = this.formGraph.startIndex;
    const start = this.formGraph.nodes[this.formGraph.startIndex];
    this.fillWithHtmlFromFile(start.path, this.textPanel);
    this.travelToPosition(start, this.view);

    textDiv.appendChild(this.textPanel);
    document.body.appendChild(textDiv);
  }

  initPreviousNextButtons() {
    this.previousButton = document.createElement('button');
    this.previousButton.id = 'previous_button';
    this.previousButton.classList.add('arrow_button', 'button_left');
    this.previousButton.style.display = 'none';
    this.previousButton.addEventListener(
      'click',
      function () {
        this.goToPreviousNode();
      }.bind(this)
    );

    this.textPanel.appendChild(this.previousButton);

    this.nextButton = document.createElement('button');
    this.nextButton.id = 'Next_button';
    this.nextButton.classList.add('arrow_button', 'button_right');
    this.nextButton.addEventListener(
      'click',
      function () {
        this.goToNextNode();
      }.bind(this)
    );

    this.textPanel.appendChild(this.nextButton);
  }

  goToPreviousNode() {
    let current = this.formGraph.nodes[this.currentIndex];
    let previous = this.formGraph.nodes[current.previous];
    if (current.previous == this.formGraph.startIndex) {
      this.previousButton.style.display = 'none';
    }
    this.nextButton.style.display = 'block';
    this.fillWithHtmlFromFile(previous.path, this.textPanel);
    this.travelToPosition(previous, this.view);
    this.currentIndex = current.previous;
  }

  goToNextNode() {
    this.saveInputValues(this.currentIndex);
    let current = this.formGraph.nodes[this.currentIndex];
    let next = this.formGraph.nodes[current.next];
    if (current.next == this.formGraph.endIndex) {
      this.nextButton.style.display = 'none';
      this.fillWithRecapValues(this.savedValues);
    } else {
      this.previousButton.style.display = 'block';
      this.fillWithHtmlFromFile(next.path, this.textPanel);
      this.travelToPosition(next, this.view);
    }
    this.currentIndex = current.next;
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
