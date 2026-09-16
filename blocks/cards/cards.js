import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Only run same-origin authored media through the EDS optimizer. External
    // (CDN) image URLs are left as-authored, otherwise createOptimizedPicture
    // strips their origin and the image 404s against the current host.
    let sameOrigin = false;
    try {
      sameOrigin = new URL(img.src, window.location.href).origin === window.location.origin;
    } catch (e) {
      sameOrigin = false;
    }
    if (sameOrigin) {
      img.closest('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
      );
    }
  });
  block.replaceChildren(ul);
}
