import { Panel } from './panel';

export class FormPanel extends Panel {
  constructor(captionConfig) {
    super(captionConfig);
    this.resolvedForms = [];
  }

  async goToVisitNode(nodeIndex) {
    super.goToVisitNode(nodeIndex).then(() => {
      this.setForm(this.visit.currentIndex);
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
}
