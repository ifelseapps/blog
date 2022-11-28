document.addEventListener('DOMContentLoaded', () => {
  if ('ontouchstart' in window) {
    return;
  }

  const menu = document.querySelectorAll('.js-menu');
  menu.forEach((current) => {
    current.classList.remove('menu_fallback');

    const firstItem = current.querySelector('a');
    const back = document.createElement('div');
    back.classList.add('menu__back');
    back.style.width = `${firstItem.offsetWidth}px`;
    current.append(back);

    current.addEventListener('mouseleave', () => {
      back.style.transition = `none`;
      back.style.transform = `translateX(-100%)`;
    });

    current.addEventListener('mousemove', (e) => {
      const item = e.target.closest('a');
      if (!item) {
        back.style.transition = `none`;
        back.style.transform = `translateX(-100%)`;
        return;
      }

      const itemWidth = item.offsetWidth;
      const itemLeft = item.offsetLeft;

      back.style.transition =
        'transform 0.7s cubic-bezier(0.68, -0.6, 0.32, 1.6)';
      back.style.width = `${itemWidth}px`;
      back.style.transform = `translateX(${itemLeft}px)`;
    });
  });
});
