import { THREE } from 'ud-viz';

export class MediaManager {
  constructor(view) {
    this.view = view;
    this.pins = [];
    this.fsImageDisplayed = false;
    document.body.addEventListener('click', (event) => {
      if (!this.fsImageDisplayed && this.pins.length > 0) {
        this.clickOnPin(event);
        this.fsImageDisplayed = true;
      } else if (this.fsImageDisplayed) {
        const fs_bg = document.getElementById('fs_image_background');
        if (fs_bg) fs_bg.remove();
        this.fsImageDisplayed = false;
      }
    });
  }

  setContent(media, contentDiv) {
    contentDiv.innerHTML = '';
    if (media.name) {
      const mediaTitle = document.createElement('h1');
      mediaTitle.innerHTML = media.name;
      contentDiv.appendChild(mediaTitle);
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
          break;
        case 'pin':
          this.createPin(content);
          break;
        default:
          console.log('Unkown media type');
      }
      if (child != null) {
        contentDiv.appendChild(child);
      }
    });
  }

  createPin(content) {
    const loader = new THREE.TextureLoader();
    loader.load(content.value, (texture) => {
      const pictureMaterial = new THREE.SpriteMaterial({
        map: texture,
        sizeAttenuation: true,
      });
      const sprite = new THREE.Sprite(pictureMaterial);
      sprite.userData = { image: content.value, caption: content.caption };

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

  deletePins() {
    this.pins.forEach((pin) => {
      this.view.getScene().remove(pin);
      pin.material.dispose();
    });
  }

  clickOnPin(event) {
    let raycaster = new THREE.Raycaster();
    let mouse3D = new THREE.Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );
    raycaster.setFromCamera(mouse3D, this.view.getCamera());
    let intersects = raycaster.intersectObjects(this.pins);
    if (intersects.length > 0) {
      const sprite = intersects[0].object;
      const background = document.createElement('div');
      background.id = 'fs_image_background';

      const image = document.createElement('img');
      image.classList.add('fs_image');
      image.src = sprite.userData.image;
      background.appendChild(image);

      const caption = document.createElement('p');
      caption.classList.add('fs_image_caption', 'panel');
      caption.innerHTML = sprite.userData.caption;
      background.appendChild(caption);

      document.body.appendChild(background);
    }
  }
}