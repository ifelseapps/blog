import './menu';
import './settings';

document.addEventListener('DOMContentLoaded', function () {
  // TODO: вынести в отдельный хэлпер
  if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
  }
});
