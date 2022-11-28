const settingsBtn = document.getElementById('settings-btn');
const settingsBlock = document.getElementById('settings-block');
const themeToggler = document.getElementById('theme-toggler');
const themeTogglerCheckbox = themeToggler.querySelector('input');
const page = document.getElementById('page');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const defaultTheme = themeMeta.content;
const LOCAL_STORAGE_KEY = 'dark_theme';
const isDarkThemeEnabled = localStorage[LOCAL_STORAGE_KEY] === 'Y';

settingsBtn.addEventListener('click', function () {
  if (settingsBlock.classList.contains('settings_visible')) {
    page.style.transform = `translate3d(0, 0, 0)`;
  } else {
    page.style.transform = `translate3d(0, ${Math.floor(
      settingsBlock.clientHeight
    )}px, 0)`;
  }
  settingsBlock.classList.toggle('settings_visible');
});

themeTogglerCheckbox.addEventListener('change', function () {
  document.documentElement.classList.toggle('theme-dark');

  // После переключения темы не нужно оставлять выделение данного контролла
  this.blur();

  const blackTheme = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--theme-background');

  themeMeta.content = this.checked ? blackTheme : defaultTheme;

  if (window.localStorage) {
    localStorage[LOCAL_STORAGE_KEY] = this.checked ? 'Y' : 'N';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  if (window.localStorage && isDarkThemeEnabled) {
    themeTogglerCheckbox.click();
  }

  // Включаем transition'ы после того как передвинули toggler в нужное положение
  setTimeout(
    () => themeToggler.classList.remove('theme-switcher_animation-off'),
    0
  );
});
