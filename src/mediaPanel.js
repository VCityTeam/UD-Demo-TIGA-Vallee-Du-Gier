export class MediaPanel {
  constructor() {
    this.content = null;
    this.mainPanel = null;
    this.isDragged = false;
    this.initMainPanel();
    this.setDraggable();
    this.mainPanel.style.display = 'none';
    this.isClosed = true;
  }

  initMainPanel() {
    this.mainPanel = document.createElement('div');
    this.mainPanel.id = 'media_panel';
    this.mainPanel.classList.add('panel');

    this.contentPanel = document.createElement('div');
    this.contentPanel.id = 'media_content_panel';

    this.closeButton = document.createElement('button');
    this.closeButton.id = 'media_panel_close';
    this.closeButton.addEventListener(
      'click',
      function () {
        this.closePanel();
      }.bind(this)
    );

    this.mainPanel.appendChild(this.contentPanel);
    this.mainPanel.appendChild(this.closeButton);
    document.body.appendChild(this.mainPanel);
  }

  setContent(mediaContent) {
    this.content = mediaContent;
    fetch(this.content.path)
      .then((response) => response.text())
      .then((text) => {
        this.contentPanel.innerHTML = text;
        this.mainPanel.style.display = 'flex';
        this.isClosed = false;
      });
  }

  closePanel() {
    this.content = null;
    this.contentPanel.innerHTML = '';
    this.mainPanel.style.display = 'none';
    this.isClosed = true;
  }

  setDraggable() {
    this.pos = { x: 0, y: 0 };
    this.mainPanel.addEventListener(
      'mousedown',
      function (e) {
        e = e || window.event;
        e.preventDefault();
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        this.isDragged = true;
      }.bind(this)
    );

    this.mainPanel.addEventListener(
      'mousemove',
      function (e) {
        if (this.isDragged) {
          e.preventDefault();
          this.mainPanel.style.top =
            this.mainPanel.offsetTop - (this.pos.y - e.clientY) + 'px';
          this.mainPanel.style.left =
            this.mainPanel.offsetLeft - (this.pos.x - e.clientX) + 'px';
          this.pos.x = e.clientX;
          this.pos.y = e.clientY;
        }
      }.bind(this)
    );

    this.mainPanel.addEventListener(
      'mouseup',
      function (e) {
        this.isDragged = false;
      }.bind(this)
    );

    window.addEventListener(
      'resize',
      function () {
        this.mainPanel.style.top = '10%';
        this.mainPanel.style.left = '50%';
      }.bind(this)
    );
  }
}
