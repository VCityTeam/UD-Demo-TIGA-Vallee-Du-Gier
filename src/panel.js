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

  reset() {
    this.savedValues = [];
  }

  start() {
    this.setButtonsStyle(true, false);
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

  updateHeader(currentIndex, endIndex, currentCategory) {
    this.progressCount.innerHTML = currentIndex + 1 + ' / ' + (endIndex + 1);
    this.categoryButtons.forEach((button) => {
      if (button.id == currentCategory) button.style.fontWeight = 'bold';
      else button.style.fontWeight = 'normal';
    });
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
    this.closeButton = document.getElementById('close_button');
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
    this.closeArrow = document.getElementById('close_arrow');
  }

  initHeader() {
    this.categoriesDiv = document.getElementById('categories_div');
    this.previousButton = document.getElementById('previous_button');
    this.progressCount = document.getElementById('progress_count');
    this.nextButton = document.getElementById('next_button');
    this.categoryButtons = [];
  }

  initRecapButtons() {
    this.restartButton = document.createElement('button');
    this.restartButton.id = 'restart_button';
    this.restartButton.classList.add('recap-button');
    this.restartButton.innerHTML = 'Recommencer';
    this.mediaContainer.appendChild(this.restartButton);

    this.mediaContainer.appendChild(document.createElement('br'));

    this.visitButton = document.createElement('button');
    this.visitButton.id = 'visit_button';
    this.visitButton.classList.add('recap-button');
    this.visitButton.innerHTML = 'Visite Libre';
    this.mediaContainer.appendChild(this.visitButton);
  }

  closePanel() {
    this.contentPanel.style.display = 'none';
    this.previousWidth = this.width;
    this.setWidth();
    this.closeArrow.style.transform = 'rotate(-45deg)';
    this.closeArrow.style.left = '5px';
    this.isClosed = true;
  }

  openPanel() {
    this.contentPanel.style.display = 'block';
    this.setWidth(this.previousWidth);
    this.closeArrow.style.transform = 'rotate(135deg)';
    this.closeArrow.style.left = '9px';
    this.isClosed = false;
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

  createCategoryButton(category) {
    const category_button = document.createElement('button');
    category_button.id = category.id;
    category_button.classList.add('category_button');
    category_button.innerText = category.name;
    this.categoriesDiv.appendChild(category_button);
    this.categoryButtons.push(category_button);
    return category_button;
  }
}
