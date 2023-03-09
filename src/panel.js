export class Panel {
  constructor() {
    this.savedValues = [];
    this.mainPanel = null;
    this.contentPanel = null;
    this.headerPanel = null;
    this.textPanel = null;
    this.footerPanel = null;
    this.isClosed = false;
    this.initPanel();
    this.initCloseButton();
  }

  reset() {
    this.savedValues = [];
  }

  start(nodePath, nodeIndex) {
    this.setButtonsStyle(true, false);
    this.fillWithHtmlFromFile(nodePath, nodeIndex);
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

  initPanel() {
    this.mainPanel = document.createElement('div');
    this.mainPanel.id = 'main_panel';

    this.contentPanel = document.createElement('div');
    this.contentPanel.id = 'content_panel';
    this.mainPanel.appendChild(this.contentPanel);

    this.headerPanel = document.createElement('div');
    this.headerPanel.id = 'header_panel';
    this.contentPanel.appendChild(this.headerPanel);

    this.textPanel = document.createElement('div');
    this.textPanel.id = 'text_panel';
    this.contentPanel.appendChild(this.textPanel);

    this.formContainer = document.createElement('div');
    this.formContainer.id = 'form_container';
    this.textPanel.appendChild(this.formContainer);

    this.mediaContainer = document.createElement('div');
    this.mediaContainer.id = 'media_container';
    this.textPanel.appendChild(this.mediaContainer);

    this.footerPanel = document.createElement('div');
    this.footerPanel.id = 'footer_panel';
    this.contentPanel.appendChild(this.footerPanel);

    const mainDiv = document.createElement('div');
    mainDiv.id = 'main_div';
    mainDiv.appendChild(this.mainPanel);
    document.body.appendChild(mainDiv);
  }

  initPreviousNextButtons() {
    this.previousButton = document.createElement('button');
    this.previousButton.id = 'previous_button';
    this.previousButton.classList.add('arrow_button', 'button_left');
    this.headerPanel.appendChild(this.previousButton);

    this.nextButton = document.createElement('button');
    this.nextButton.id = 'Next_button';
    this.nextButton.classList.add('arrow_button', 'button_right');
    this.headerPanel.appendChild(this.nextButton);
  }

  initCloseButton() {
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'close_button';
    this.closeButton.addEventListener(
      'click',
      function () {
        if (this.isClosed) {
          this.openPanel();
        } else {
          this.closePanel();
        }
      }.bind(this)
    );

    const arrow = document.createElement('div');
    arrow.id = 'close_arrow';
    this.closeButton.appendChild(arrow);

    this.mainPanel.appendChild(this.closeButton);
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

  closePanel() {
    this.contentPanel.style.display = 'none';
    this.mainPanel.style.width = '0%';
    this.closeButton.firstChild.style.transform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(-45deg)';
    this.closeButton.firstChild.style.left = '5px';
    this.isClosed = true;
  }

  openPanel() {
    this.contentPanel.style.display = 'block';
    this.mainPanel.style.width = '30%';
    this.closeButton.firstChild.style.transform = 'rotate(135deg)';
    this.closeButton.firstChild.style.webkitTransform = 'rotate(135deg)';
    this.closeButton.firstChild.style.left = '9px';
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

  cleanMediaContainer() {
    this.mediaContainer.style.display = 'none';
    this.mediaContainer.innerHTML = '';
  }
}

