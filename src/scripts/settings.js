const settingsBtn = document.getElementById('settings-btn');
const settingsBlock = document.getElementById('settings-block');
const themeToggler = document.getElementById('theme-toggler');
const themeTogglerCheckbox = themeToggler.querySelector('input');
const page = document.getElementById('page');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const defaultTheme = themeMeta.content;
const LOCAL_STORAGE_KEY = 'dark_theme';

settingsBtn.addEventListener('click', function () {
  if (settingsBlock.classList.contains('settings_visible')) {
    page.style.transform = `translate3d(0, 0, 0)`;
  } else {
    // TODO: -1 - костыль, надо разобраться почему прорисовывается тонкая линия
    // между блоком настроек и header'ом
    page.style.transform = `translate3d(0, ${
      settingsBlock.clientHeight - 1
    }px, 0)`;
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
  const theme = getTheme();

  if (theme === 'dark') {
    themeTogglerCheckbox.click();
  }
});

function getTheme() {
  const themeFromStorage = getThemeFromStorage();

  if (themeFromStorage) {
    console.log('__BB__', themeFromStorage);
    return themeFromStorage;
  }

  console.log('__AAA__');
  const isEnabledSystemDarkTheme = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  if (isEnabledSystemDarkTheme) {
    console.log('__XXX_TEST__', themeFromStorage);
    return 'dark';
  }

  return 'light';
}

function getThemeFromStorage() {
  try {
    if (localStorage[LOCAL_STORAGE_KEY] === 'Y') {
      return 'dark';
    }

    if (localStorage[LOCAL_STORAGE_KEY] === 'N') {
      return 'light';
    }
  } catch {
    return null;
  }

  return null;
}
