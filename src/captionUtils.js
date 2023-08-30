export function createCaption(style, text, margin = 0) {
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
