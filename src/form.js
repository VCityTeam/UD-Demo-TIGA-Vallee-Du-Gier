import { THREE } from 'ud-viz';

export class Form {
  constructor(view, formGraph) {
    this.savedValues = [];
    this.view = view;
    this.formGraph = formGraph;
    this.textPanel = null;
    this.currentIndex = -1;
    this.initTextPanel();
    this.initRecapPanel();
    this.initEndButton();
    this.initPreviousNextButtons();
  }

  fillWithHtmlFromFile(fileName) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        document.getElementById('form_page').innerHTML = text;
      });
  }

  fillWithValues(values, target) {
    values.forEach((array) => {
      target.appendChild(document.createTextNode(array.join('; ')));
      target.appendChild(document.createElement('br'));
    });
  }

  initTextPanel() {
    this.textPanel = document.createElement('div');
    this.textPanel.id = 'text_panel';
    this.textPanel.style.height = '87%';
    this.textPanel.style.width = '35%';
    this.textPanel.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    this.textPanel.style.position = 'absolute';
    this.textPanel.style.zIndex = '8';
    this.textPanel.style.padding = '36px 1px 0 0';
    this.textPanel.style.margin = '2%';
    this.textPanel.style.borderRadius = '37px';

    const formPage = document.createElement('div');
    formPage.id = 'form_page';
    formPage.style.margin = '0px 50px';
    this.textPanel.appendChild(formPage);

    this.currentIndex = this.formGraph.startIndex;
    const start = this.formGraph.nodes[this.formGraph.startIndex];
    this.fillWithHtmlFromFile(start.path, this.textPanel);
    this.travelToPosition(start, this.view);
    document.getElementById('_all_widget').appendChild(this.textPanel);
  }

  initRecapPanel() {
    this.recapPanel = document.createElement('div');
    this.recapPanel.id = 'recap_panel';
    this.recapPanel.style.float = 'left';
    this.recapPanel.style.height = '100%';
    this.recapPanel.style.width = '100%';
    this.recapPanel.style.backgroundColor = 'white';
    this.recapPanel.style.display = 'none';

    const recapHeader = document.createElement('h1');
    recapHeader.innerHTML = 'Recap';
    this.recapPanel.appendChild(recapHeader);

    const recapText = document.createElement('p');
    recapText.id = 'recap_text';
    this.recapPanel.appendChild(recapText);
    document.body.appendChild(this.recapPanel);
  }

  initEndButton() {
    this.endButton = document.createElement('button');
    this.endButton.id = 'end_button';
    this.endButton.classList.add('arrow_button', 'button_right');
    this.endButton.style.display = 'none';
    this.endButton.addEventListener(
      'click',
      function () {
        this.saveInputValues(this.currentIndex);

        this.previousButton.style.display = 'none';
        this.nextButton.style.display = 'none';
        this.endButton.style.display = 'none';
        this.textPanel.style.display = 'none';
        document.getElementById('_all_widget').style.display = 'none';

        this.recapPanel.style.display = 'block';
        this.fillWithValues(
          this.savedValues,
          document.getElementById('recap_text')
        );
      }.bind(this)
    );
    this.textPanel.appendChild(this.endButton);
    console.log(this.textPanel);
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
