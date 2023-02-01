import { THREE } from 'ud-viz';

export class MediaPanel {
  constructor(view) {
    this.content = null;
    this.mainPanel = null;
    this.isDragged = false;
    this.view = view;
    this.initMainPanel();
    this.setDraggable();
    this.mainPanel.style.display = 'none';
    this.pins = [];
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

  setContent(media) {
    this.contentPanel.innerHTML = '';
    if (media.name) {
      const mediaTitle = document.createElement('h1');
      mediaTitle.innerHTML = media.name;
      this.contentPanel.appendChild(mediaTitle);
    }
    media.contents.forEach((content) => {
      let child = null;
      switch (content.type) {
        case 'text':
          child = document.createElement('p');
          child.innerHTML = content.value;
          break;
        case 'video':
          child = document.createElement('video');
          child.src = content.value;
          child.controls = true;
          child.muted = false;
          break;
        case 'image':
          child = document.createElement('img');
          child.src = content.value;
          break;
        case 'audio':
          child = document.createElement('audio');
          child.src = content.value;
          child.controls = true;
          child.muted = false;
          child.play();
          break;
        case 'pin':
          this.createPin(content);
          break;
        default:
          console.log('Unkown media type');
      }
      if (child != null) {
        this.contentPanel.appendChild(child);
        this.mainPanel.style.display = 'flex';
        this.isClosed = false;
      }
    });
  }

  closePanel() {
    this.content = null;
    this.contentPanel.innerHTML = '';
    this.mainPanel.style.display = 'none';
    this.pins.forEach((pin) => {
      this.view.getScene().remove(pin);
      pin.material.dispose();
    });
    this.pins = [];
    this.isClosed = true;
  }

  setDraggable() {
    this.pos = { x: 0, y: 0 };
    this.mainPanel.addEventListener(
      'mousedown',
      function (e) {
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
      function () {
        this.isDragged = false;
      }.bind(this)
    );

    window.addEventListener(
      'resize',
      function () {
        this.mainPanel.style.top = '1%';
        this.mainPanel.style.right = '0%';
        this.mainPanel.style.removeProperty('left');
      }.bind(this)
    );
  }

  createPin(content) {
    const loader = new THREE.TextureLoader();
    loader.load(content.value, (texture) => {
      const pictureMaterial = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: true,
      });
      const sprite = new THREE.Sprite(pictureMaterial);

      sprite.position.set(
        content.position.x,
        content.position.y,
        content.position.z
      );

      const width = texture.image.naturalWidth;
      const height = texture.image.naturalHeight;
      if (width > height) sprite.scale.set(18 * (width / height), 18, 1);
      else sprite.scale.set(18, 18 * (height / width), 1);
      sprite.updateMatrixWorld();

      this.view.getScene().add(sprite);
      this.pins.push(sprite);
    });
  }
}
