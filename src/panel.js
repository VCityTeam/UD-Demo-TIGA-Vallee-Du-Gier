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
    switch (type) {
      case 'half':
        this.mainPanel.classList.add('half_width');
        this.mainPanel.classList.remove('full_width');
        break;
      case 'full':
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.add('full_width');
        break;
      default:
        this.mainPanel.classList.remove('half_width');
        this.mainPanel.classList.remove('full_width');
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
    if (this.savedValues && this.savedValues[nodeIndex])
      this.loadSavedValues(nodeIndex);
  }

  initPanel() {
    this.mainPanel = document.getElementById('main_panel');
    this.contentPanel = document.getElementById('content_panel');
    this.headerPanel = document.getElementById('header_panel');
    this.textPanel = document.getElementById('text_panel');
    this.mediaContainer = document.getElementById('media_container');
    this.footerPanel = document.getElementById('footer_panel');
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
    this.mainPanel.style.width = '0%';
    this.closeArrow.style.transform = 'rotate(-45deg)';
    this.closeArrow.style.webkitTransform = 'rotate(-45deg)';
    this.closeArrow.style.left = '5px';
    this.isClosed = true;
  }

  openPanel() {
    this.contentPanel.style.display = 'block';
    this.mainPanel.style.width = '30%';
    this.closeArrow.style.transform = 'rotate(135deg)';
    this.closeArrow.style.webkitTransform = 'rotate(135deg)';
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
    this.mediaContainer.innerHTML = '';
  }

  createCaption(style, text, margin = 0) {
    const captionDiv = document.createElement('div');
    captionDiv.classList.add('caption_div');
    if (margin != 0) captionDiv.style.margin = margin + 'px 0px';

    const captionSquare = document.createElement('div');
    captionSquare.classList.add('caption_square');
    captionDiv.appendChild(captionSquare);

    if (style) {
      switch (style.type) {
        case 'border':
          captionSquare.style.border = '7px solid ' + style.color;
          captionSquare.style.flex = '0 0 16px';
          captionSquare.style.height = '16px';
          break;
        case 'plain':
          captionSquare.style.background = style.color;
          break;
        case 'text':
          captionSquare.innerHTML = 'Abc';
          captionSquare.style.color = style.color;
          break;
        case 'image':
          captionSquare.style.backgroundImage = 'url(' + style.path + ')';
          break;
        default:
          captionSquare.style.background = 'white';
      }
    }

    const captionText = document.createElement('p');
    captionText.classList.add('caption_text');
    captionText.innerHTML = text;
    captionDiv.appendChild(captionText);

    return captionDiv;
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
