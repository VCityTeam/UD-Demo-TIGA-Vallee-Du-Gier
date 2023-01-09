import { THREE } from 'ud-viz';

export class Form {
  constructor(view, formGraph) {
    this.savedValues = [];
    this.view = view;
    this.formGraph = formGraph;
    this.textPanel = null;
    this.currentIndex = this.formGraph.startIndex;
    this.isClosed = false;
    this.initTextPanel();
    this.initPreviousNextButtons();
    this.initCloseButton();
  }

  fillWithHtmlFromFile(fileName) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        this.formContainer.innerHTML = text;
        this.addStyleEvents();
      });
  }

  fillWithRecapValues(values) {
    const recapTitle = document.createElement('h1');
    recapTitle.innerHTML =
      'Félicitations, vous avez terminé le parcours ' +
      this.formGraph.name +
      ' !';
    this.formContainer.appendChild(recapTitle);

    values.forEach((array) => {
      this.formContainer.appendChild(document.createTextNode(array.join('; ')));
      this.formContainer.appendChild(document.createElement('br'));
    });

    const restartButton = document.createElement('button');
    restartButton.id = 'restart_button';
    restartButton.classList.add('recap-button');
    restartButton.innerHTML = 'Recommencer';
    this.formContainer.appendChild(restartButton);

    const visitButton = document.createElement('button');
    visitButton.id = 'visit_button';
    visitButton.classList.add('recap-button');
    visitButton.innerHTML = 'Visite Libre';
    this.formContainer.appendChild(visitButton);
  }

  addStyleEvents() {
    const checkboxes = this.formContainer.querySelectorAll(
      'input[type="checkbox"]'
    );

    [].forEach.call(checkboxes, (checkbox) => {
      const label = document.querySelector(`[for="${checkbox.id}"]`);
      checkbox.addEventListener('click', function () {
        if (checkbox.checked) {
          label.style.backgroundColor = '#ffffff';
          label.style.color = '#a5a5a5';
        } else {
          label.style.backgroundColor = '#a5a5a5';
          label.style.color = '#fff';
        }
      });
      checkbox.addEventListener('mouseenter', function () {
        if (checkbox.checked)
          label.style.backgroundColor = 'rgb(235, 234, 234)';
        else label.style.backgroundColor = '#929292';
      });
      checkbox.addEventListener('mouseleave', function () {
        if (checkbox.checked) label.style.backgroundColor = '#ffffff';
        else label.style.backgroundColor = '#a5a5a5';
      });
    });

    const radios = this.formContainer.querySelectorAll('input[type="radio"]');

    [].forEach.call(radios, (radio) => {
      const label = document.querySelector(`[for="${radio.id}"]`);
      radio.addEventListener(
        'click',
        function () {
          if (radio.checked) {
            label.style.backgroundColor = '#ffffff';
            label.style.color = '#a5a5a5';
            const others = this.formContainer.querySelectorAll(
              'input:not(#' + radio.id + ')[type="radio"]'
            );
            [].forEach.call(others, (other) => {
              const otherLabel = document.querySelector(`[for="${other.id}"]`);
              otherLabel.style.backgroundColor = '#a5a5a5';
              otherLabel.style.color = '#fff';
            });
          }
        }.bind(this)
      );
      radio.addEventListener('mouseenter', function () {
        if (!radio.checked) label.style.backgroundColor = '#929292';
      });
      radio.addEventListener('mouseleave', function () {
        if (!radio.checked) label.style.backgroundColor = '#a5a5a5';
      });
    });
  }

  initTextPanel() {
    const textDiv = document.createElement('div');
    textDiv.id = 'text_div';

    this.textPanel = document.createElement('div');
    this.textPanel.id = 'text_panel';

    this.formContainer = document.createElement('div');
    this.formContainer.id = 'form_container';
    this.textPanel.appendChild(this.formContainer);

    const start = this.formGraph.nodes[this.formGraph.startIndex];
    if (start.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
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

  initCloseButton() {
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'close_button';
    this.closeButton.addEventListener(
      'click',
      function () {
        if (this.isClosed) {
          this.openTextPanel();
        } else {
          this.closeTextPanel();
        }
      }.bind(this)
    );

    const arrow = document.createElement('div');
    arrow.id = 'close_arrow';
    this.closeButton.appendChild(arrow);

    this.textPanel.appendChild(this.closeButton);
  }

  goToPreviousNode() {
    this.formContainer.innerHTML = '';
    let current = this.formGraph.nodes[this.currentIndex];
    let previous = this.formGraph.nodes[current.previous];
    if (previous.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
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
    this.formContainer.innerHTML = '';
    let current = this.formGraph.nodes[this.currentIndex];
    let next = this.formGraph.nodes[current.next];
    if (next.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
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

  closeTextPanel() {
    this.textPanel.style.width = '1%';
    this.nextButton.style.display = 'none';
    this.previousButton.style.display = 'none';
    this.closeButton.firstChild.style.transform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.left = '7px';
    this.isClosed = true;
  }

  openTextPanel() {
    const currentNode = this.formGraph.nodes[this.currentIndex];
    this.textPanel.style.width = currentNode.type == 'half' ? '35%' : '100%';
    if (this.currentIndex != this.formGraph.startIndex)
      this.previousButton.style.display = 'block';
    if (this.currentIndex != this.formGraph.endIndex)
      this.nextButton.style.display = 'block';
    this.closeButton.firstChild.style.transform = 'rotate(135deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(135deg)';
    this.closeButton.firstChild.style.left = '14px';
    this.isClosed = false;
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
    const formInputs = this.formContainer.querySelectorAll('input, select');
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
