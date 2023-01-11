import { THREE } from 'ud-viz';

export class Form {
  constructor(view) {
    this.savedValues = [];
    this.view = view;
    this.textPanel = null;
    this.currentIndex = -1;
    this.isClosed = false;
    this.initTextPanel();
    this.initPreviousNextButtons();
    this.initCloseButton();
  }

  resetForm() {
    this.savedValues = [];
    this.currentIndex = -1;
  }

  displayForm() {
    document.getElementById('text_div').style.display = 'flex';
  }

  hideForm() {
    document.getElementById('text_div').style.display = 'none';
    let allWidgetPanel = document.getElementById(
      '_all_widget_stuct_main_panel'
    );
    allWidgetPanel.style.display = 'grid';
    allWidgetPanel.querySelector('nav').style.display = 'inline-block';
  }

  fillWithHtmlFromFile(fileName) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        this.formContainer.innerHTML = text;
        this.addStyleEvents();
        if (this.savedValues && this.savedValues[this.currentIndex])
          this.loadSavedValues(this.currentIndex);
      });
  }

  fillWithRecapValues(values) {
    const recapTitle = document.createElement('h1');
    recapTitle.innerHTML =
      'Félicitations, vous avez terminé le parcours ' + this.graph.name + ' !';
    this.formContainer.appendChild(recapTitle);

    values.forEach((array) => {
      this.formContainer.appendChild(
        document.createTextNode(array.map((v) => v.text).join('; '))
      );
      this.formContainer.appendChild(document.createElement('br'));
    });

    const restartButton = document.createElement('button');
    restartButton.id = 'restart_button';
    restartButton.classList.add('recap-button');
    restartButton.innerHTML = 'Recommencer';
    restartButton.addEventListener(
      'click',
      function () {
        this.resetForm();
        document.getElementById('entry_panel').style.display = 'block';
      }.bind(this)
    );
    this.formContainer.appendChild(restartButton);

    const visitButton = document.createElement('button');
    visitButton.id = 'visit_button';
    visitButton.classList.add('recap-button');
    visitButton.innerHTML = 'Visite Libre';
    visitButton.addEventListener(
      'click',
      function () {
        this.hideForm();
        window.dispatchEvent(new Event('resize'));
      }.bind(this)
    );
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

    textDiv.appendChild(this.textPanel);
    document.body.appendChild(textDiv);
  }

  initPreviousNextButtons() {
    this.previousButton = document.createElement('button');
    this.previousButton.id = 'previous_button';
    this.previousButton.classList.add('arrow_button', 'button_left');
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

  startForm(graph) {
    this.graph = graph;
    this.currentIndex = this.graph.startIndex;
    const start = this.graph.nodes[this.currentIndex];
    if (start.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
    this.previousButton.style.display = 'none';
    this.nextButton.style.display = 'block';
    this.fillWithHtmlFromFile(start.path, this.textPanel);
    this.travelToPosition(start, this.view);
  }

  goToPreviousNode() {
    this.saveInputValues(this.currentIndex);
    this.formContainer.innerHTML = '';
    let current = this.graph.nodes[this.currentIndex];
    let previous = this.graph.nodes[current.previous];
    if (previous.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
    if (current.previous == this.graph.startIndex) {
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
    let current = this.graph.nodes[this.currentIndex];
    let next = this.graph.nodes[current.next];
    if (next.type == 'half') {
      this.textPanel.style.width = '35%';
    } else {
      this.textPanel.style.width = '100%';
    }
    if (current.next == this.graph.endIndex) {
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
    this.formContainer.style.display = 'none';
    this.textPanel.style.width = '1%';
    this.nextButton.style.display = 'none';
    this.previousButton.style.display = 'none';
    this.closeButton.firstChild.style.transform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.left = '7px';
    this.isClosed = true;
  }

  openTextPanel() {
    const currentNode = this.graph.nodes[this.currentIndex];
    this.textPanel.style.width = currentNode.type == 'half' ? '35%' : '100%';
    this.formContainer.style.display = 'block';
    if (this.currentIndex != this.graph.startIndex)
      this.previousButton.style.display = 'block';
    if (this.currentIndex != this.graph.endIndex)
      this.nextButton.style.display = 'block';
    this.closeButton.firstChild.style.transform = 'rotate(135deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(135deg)';
    this.closeButton.firstChild.style.left = '14px';
    this.isClosed = false;
  }

  travelToPosition(graphNode, view) {
    if (graphNode.position && graphNode.rotation) {
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
    }
  }

  saveInputValues(nodeIndex) {
    const formInputs = this.formContainer.querySelectorAll('input, select');
    let values = [];
    formInputs.forEach((input) => {
      let value = { option: '', text: '' };
      if (input.nodeName == 'INPUT') {
        switch (input.type) {
          case 'text':
            value.text = input.value;
            break;
          default:
            value.option = input.checked;
            if (input.checked) {
              value.text = document.querySelector(
                'label[for=' + input.id + ']'
              ).innerHTML;
            }
        }
      }
      if (input.nodeName == 'SELECT') {
        value.text = input.options[input.selectedIndex].text;
        value.option = input.options[input.selectedIndex].value;
      }
      values.push(value);
    });
    this.savedValues[nodeIndex] = values;
  }

  loadSavedValues(nodeIndex) {
    const formInputs = this.formContainer.querySelectorAll('input, select');
    let i = 0;
    formInputs.forEach((input) => {
      const value = this.savedValues[nodeIndex][i];
      if (input.nodeName == 'INPUT') {
        switch (input.type) {
          case 'text':
            input.value = value.text;
            break;
          default:
            if (value.option) input.click();
        }
      }
      if (input.nodeName == 'SELECT') {
        input.value = value.option;
      }
      i++;
    });
  }
}
