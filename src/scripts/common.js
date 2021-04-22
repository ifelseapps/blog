const page = document.querySelector('.js-page');
const hamburger = document.querySelector('.js-hamburger');
const menu = document.querySelector('.js-menu');

hamburger.addEventListener('click', () => {
  if (menu.classList.contains('js-visible')) {
    menu.classList.remove('js-visible');
    page.style.transform = `translateY(0)`;
    return;
  }
  menu.classList.add('js-visible');
  page.style.transform = `translateY(${menu.clientHeight}px)`;
});

const hideChildMenu = () => {
  if (!window.matchMedia("(min-width: 992px)").matches) {
    return;
  }
  const allChildren = menu.querySelectorAll('.js-menu-popup');
  allChildren.forEach(el => el.style.display = 'none');
};

menu.addEventListener('mouseover', ({ target }) => {
  if (!window.matchMedia("(min-width: 992px)").matches) {
    return;
  }

  const item = target.closest('.js-menu-item');
  if (!item) {
    return;
  }

  hideChildMenu();

  const children = item.querySelector('.js-menu-popup');
  if (children) {
    children.style.display = 'block';
  }
});

menu.addEventListener('mouseout', hideChildMenu);
