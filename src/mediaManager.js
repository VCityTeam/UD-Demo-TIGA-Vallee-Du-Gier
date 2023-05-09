import { THREE } from 'ud-viz';

export class MediaManager {
  constructor(view) {
    this.view = view;
    this.pins = [];
    this.fsImageDisplayed = false;
  }

  addClickOnPinEvent(callback) {
    document.body.addEventListener('click', (event) => {
      let raycaster = new THREE.Raycaster();
      let mouse3D = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      raycaster.setFromCamera(mouse3D, this.view.getCamera());
      let intersects = raycaster.intersectObjects(this.pins);
      if (intersects.length > 0) {
        callback(intersects[0].object);
      }
    });
  }

  async addContent(media, contentDiv) {
    const mediaDiv = document.createElement('div');
    contentDiv.appendChild(mediaDiv);
    if (media.name) {
      const mediaTitle = document.createElement('h1');
      mediaTitle.innerHTML = media.name;
      mediaDiv.appendChild(mediaTitle);
    }
    for (const content of media.contents) {
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
          break;
        case 'pin':
          this.createPin(content.value, content.position, 18, {
            image: content.value,
            caption: content.caption,
          });
          break;
        case 'file':
          child = await this.fetchFile(content.value);
          break;
        default:
          console.log('Unkown media type');
      }
      if (child != null) {
        mediaDiv.appendChild(child);
      }
    }
  }

  createPin(path, position, scale=20, userData={}) {
    const loader = new THREE.TextureLoader();
    loader.load(path, (texture) => {
      const pictureMaterial = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: true,
      });
      const sprite = new THREE.Sprite(pictureMaterial);
      sprite.userData = userData;

      sprite.position.set(position.x, position.y, position.z);

      const width = texture.image.naturalWidth;
      const height = texture.image.naturalHeight;
      if (width > height) sprite.scale.set(scale * (width / height), scale, 1);
      else sprite.scale.set(scale, scale * (height / width), 1);
      sprite.updateMatrixWorld();

      this.view.getScene().add(sprite);
      this.view.layerManager.notifyChange();
      this.pins.push(sprite);
    });
  }

  deletePins() {
    this.pins.forEach((pin) => {
      this.view.getScene().remove(pin);
      pin.material.dispose();
    });
  }

  fetchFile(fileName) {
    return new Promise((resolve) => {
      fetch(fileName)
        .then((response) => response.text())
        .then((text) => {
          const fileDiv = document.createElement('div');
          fileDiv.classList.add('file_div');
          fileDiv.innerHTML = text;
          resolve(fileDiv);
        });
    });
  }
}
