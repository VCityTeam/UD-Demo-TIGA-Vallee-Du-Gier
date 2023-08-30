export class Panel {
  constructor() {
    this.savedValues = [];
    this.resolvedForms = [];
    this.mainPanel = null;
    this.contentPanel = null;
    this.headerPanel = null;
    this.textPanel = null;
    this.captionPanel = null;
    this.footerPanel = null;
    this.isClosed = false;
    this.width = 'half';
    this.initPanel();
  }

  setButtonsStyle(isStart, isEnd) {
    this.previousButton.disabled = isStart;
    this.nextButton.disabled = isEnd;
  }

  setWidth(type) {
    this.width = type;
    switch (type) {
      case 'half':
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.remove('smaller_width');
        this.mainPanel.classList.add('half_width');
        break;
      case 'full':
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('smaller_width');
        this.mainPanel.classList.add('full_width');
        break;
      case 'smaller':
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.add('smaller_width');
        break;
      default:
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('full_width');
        this.mainPanel.classList.remove('smaller_width');
    }
  }

  setForm(nodeIndex) {
    const fileDiv = this.mediaContainer.querySelector('.file_div');
    if (fileDiv) {
      const inputs = this.mediaContainer.querySelectorAll('input');
      if (this.resolvedForms[nodeIndex]) {
        fileDiv.classList.add('resolved_form');
        for (const input of inputs) input.disabled = true;
      } else {
        for (const input of inputs) {
          input.addEventListener(
            'click',
            function () {
              this.resolvedForms[nodeIndex] = true;
              fileDiv.classList.add('resolved_form');
              for (const i of inputs) i.disabled = true;
            }.bind(this)
          );
        }
      }
    }
  }

  initPanel() {
    this.mainPanel = document.getElementById('main_panel');
    this.contentPanel = this.mainPanel.querySelector('.content_panel');
    this.headerPanel = this.mainPanel.querySelector('.header_panel');
    this.textPanel = this.mainPanel.querySelector('.text_panel');
    this.mediaContainer = document.getElementById('media_container');
    this.captionPanel = this.mainPanel.querySelector('.caption_panel');
    this.footerPanel = this.mainPanel.querySelector('.footer_panel');
    this.previousButton = document.getElementById('previous_button');
    this.nextButton = document.getElementById('next_button');
  }

  saveInputValues(nodeIndex) {
    const formInputs = this.mediaContainer.querySelectorAll('input, select');
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
    const formInputs = this.mediaContainer.querySelectorAll('input, select');
    let i = 0;
    formInputs.forEach((input) => {
      const value = this.savedValues[nodeIndex][i];
      if (input.nodeName == 'INPUT') {
        switch (input.type) {
          case 'text':
            input.value = value.text;
            break;
          default:
            input.checked = value.option;
        }
      }
      if (input.nodeName == 'SELECT') {
        input.value = value.option;
      }
      i++;
    });
  }

  cleanMediaContainer() {
    this.mediaContainer.innerHTML = '';
  }
}
