export class Form {
  constructor() {
    this.savedValues = [];
    this.textPanel = null;
    this.isClosed = false;
    this.initTextPanel();
    this.initPreviousNextButtons();
    this.initCloseButton();
  }

  reset() {
    this.savedValues = [];
  }

  hide() {
    document.getElementById('text_div').style.display = 'none';
    let allWidgetPanel = document.getElementById(
      '_all_widget_stuct_main_panel'
    );
    allWidgetPanel.style.display = 'grid';
    allWidgetPanel.querySelector('nav').style.display = 'inline-block';
    window.dispatchEvent(new Event('resize'));
  }

  start(nodeType, nodePath, nodeIndex) {
    this.setButtonsStyle(true, false);
    this.setWidth(nodeType);
    this.fillWithHtmlFromFile(nodePath, nodeIndex);
  }

  setWidth(nodeType) {
    this.textPanel.style.width = nodeType == 'half' ? '35%' : '100%';
  }

  setButtonsStyle(isStart, isEnd) {
    this.previousButton.style.display = isStart ? 'none' : 'block';
    this.nextButton.style.display = isEnd ? 'none' : 'block';
  }

  fillWithHtmlFromFile(fileName, nodeIndex) {
    fetch(fileName)
      .then((response) => response.text())
      .then((text) => {
        this.formContainer.innerHTML = text;
        this.addStyleEvents();
        if (this.savedValues && this.savedValues[nodeIndex])
          this.loadSavedValues(nodeIndex);
      });
  }

  fillWithRecapValues(visitName) {
    const recapTitle = document.createElement('h1');
    recapTitle.innerHTML =
      'Félicitations, vous avez terminé le parcours ' + visitName + ' !';
    this.formContainer.appendChild(recapTitle);

    this.savedValues.forEach((array) => {
      this.formContainer.appendChild(
        document.createTextNode(array.map((v) => v.text).join('; '))
      );
      this.formContainer.appendChild(document.createElement('br'));
    });
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
    this.textPanel.classList.add('panel');

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
    this.textPanel.appendChild(this.previousButton);

    this.nextButton = document.createElement('button');
    this.nextButton.id = 'Next_button';
    this.nextButton.classList.add('arrow_button', 'button_right');
    this.textPanel.appendChild(this.nextButton);
  }

  initCloseButton() {
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'close_button';

    const arrow = document.createElement('div');
    arrow.id = 'close_arrow';
    this.closeButton.appendChild(arrow);

    this.textPanel.appendChild(this.closeButton);
  }

  initRecapButtons() {
    this.restartButton = document.createElement('button');
    this.restartButton.id = 'restart_button';
    this.restartButton.classList.add('recap-button');
    this.restartButton.innerHTML = 'Recommencer';
    this.formContainer.appendChild(this.restartButton);

    this.visitButton = document.createElement('button');
    this.visitButton.id = 'visit_button';
    this.visitButton.classList.add('recap-button');
    this.visitButton.innerHTML = 'Visite Libre';
    this.formContainer.appendChild(this.visitButton);
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

  openTextPanel(nodeType, isStart, isEnd) {
    this.setWidth(nodeType);
    this.formContainer.style.display = 'block';
    this.setButtonsStyle(isStart, isEnd);
    this.closeButton.firstChild.style.transform = 'rotate(135deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(135deg)';
    this.closeButton.firstChild.style.left = '14px';
    this.isClosed = false;
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
