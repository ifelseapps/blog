---
title: Вывод цветовой палитры в Storybook
date: 2022-01-17
date_label: 2022-01-17
is_favorite: true
tags:
- storybook
- design systems
preview_text: Цветовая палитра — неотъемлемая часть любой дизайн-системы. Я хочу поделиться рецептом вывода цветовой палитры на основе значений css custom properties (т.к. они доступны в runtime).
description: Цветовая палитра — неотъемлемая часть любой дизайн-системы. Я хочу поделиться рецептом вывода цветовой палитры на основе значений css custom properties (т.к. они доступны в runtime).
---
Допустим, в проекте используются следующие цвета.
```css
:root {
  --color-primary: blue;
  --color-secondary: orange;
}
```

Теперь попробуем вывести эти цвета в виде палитры.

Я хочу вывести нашу цветовую палитру в отдельном разделе — Colors. Для этого создадим файл `./docs/colors.tsx`.
``` tsx
import { Meta } from '@storybook/react';

export default {
  title: 'Lego'
} as Meta;

export const Colors = () => (
  <div>Color palette</div>
);

Colors.parameters = {
  previewTabs: {
    'storybook/docs/panel': {
      hidden: true,
    },
  },
};
```

Поправим конфиг storybook в файле `main.js`.

```js/2
module.exports = {
  'stories': [
    '../docs/**/*.(tsx|mdx)',
    '../src/components/**/*.stories.tsx',
  ],
  'addons': [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  'framework': '@storybook/react'
};
```

При запуске storybook мы увидим, что наша story успешно добавилась.
{% image './src/posts/displaying-color-palette-in-storybook/color-palette-storybook-1.png', 'Пустая story' %}

Основой нашего механизма будет функция `getColorsFromCustomProperties`.

``` tsx
function getColorsFromCustomProperties() {
  // ...
}
```
Давайте порассуждаем о ее реализации. Мы можем воспользоваться методом `getPropertyValue`, но он ожидает на вход property name.

``` tsx
console.log(
	getComputedStyle(document.documentElement)
		.getPropertyValue('--color-parimary')
);
```

Мы не хотим завязываться на конкретные custom properties. Нам нужно вывести все доступные properties. Поэтому данный метод нам не подходит.

У глобального объекта `document` есть свойство `styleSheets`. Давайте посмотрим что оно содержит.
{% image './src/posts/displaying-color-palette-in-storybook/color-palette-storybook-2.png', 'Объект styleSheets' %}

Отфильтруем таблицы стилей только для текущего домена.

```tsx
function getColorsFromCustomProperties() {
  const isCurrentDomain = (stylesheet: CSSStyleSheet) =>
    !stylesheet.href || stylesheet.href.indexOf(window.location.origin) === 0;

  return Array.from(document.styleSheets)
    .filter(isCurrentDomain);
}
```

Далее пройдемся по каждому элементу `CSSStyleSheet`. У каждого объекта нас будет интересовать свойство `cssRules`. Пройдемся также по каждому `CSSStyleRule`. Нас будут интересовать только rule с [STYLE_RULE](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/type) === 1, селектор которых начинается с `:root`.

```tsx
function getColorsFromCustomProperties() {
  const isCurrentDomain = (stylesheet: CSSStyleSheet) =>
    !stylesheet.href || stylesheet.href.indexOf(window.location.origin) === 0;

   const isStyleRule = (rule: CSSStyleRule) => rule.STYLE_RULE === 1;

   const isRootSelector = (rule: CSSStyleRule) => (rule.selectorText || '').startsWith(':root');

  return Array.from(document.styleSheets)
    .filter(isCurrentDomain)
    .reduce((acc, stylesheet) => {
      const rules = Array.from(stylesheet.cssRules)
        .filter((rule: CSSStyleRule) => isStyleRule(rule) && isRootSelector(rule));

      console.log(rules);

      return acc;
    }, []);
}
```

Отфильтруем свойства, начинающиеся с `--color-` и соберем custom properties в массив.
```tsx
function getColorsFromCustomProperties() {
  const isCurrentDomain = (stylesheet: CSSStyleSheet) =>
    !stylesheet.href || stylesheet.href.indexOf(window.location.origin) === 0;

   const isStyleRule = (rule: CSSStyleRule) => rule.STYLE_RULE === 1;

   const isRootSelector = (rule: CSSStyleRule) => (rule.selectorText || '').startsWith(':root');

   const isColorProp = (prop: string) => prop.startsWith('--color-');

  return Array.from(document.styleSheets)
    .filter(isCurrentDomain)
    .reduce((acc, stylesheet) => {
      const rules = Array.from(stylesheet.cssRules)
        .filter((rule: CSSStyleRule) => isStyleRule(rule) && isRootSelector(rule));

      const properties = rules.reduce((allProperties, rule: CSSStyleRule) => [
        ...allProperties,
        ...Array.from(rule.style)
          .filter(isColorProp)
          .map((prop) => prop.trim()),
      ], []);

      console.log(properties); // ["--color-primary", "--color-secondary"]

      return acc;
    }, []);
}
```

Прокинем собранные свойства в результирующий массив. Также допишем недостающие типы. Все, наша функция готова.
```tsx
function getColorsFromCustomProperties() {
  const isCurrentDomain = (stylesheet: CSSStyleSheet) =>
    !stylesheet.href || stylesheet.href.indexOf(window.location.origin) === 0;

   const isStyleRule = (rule: CSSStyleRule) => rule.STYLE_RULE === 1;

   const isRootSelector = (rule: CSSStyleRule) => (rule.selectorText || '').startsWith(':root');

   const isColorProp = (prop: string) => prop.startsWith('--color-');

  return Array.from(document.styleSheets)
    .filter(isCurrentDomain)
    .reduce<string[]>((acc, stylesheet) => {
      const rules = Array.from(stylesheet.cssRules)
        .filter((rule: CSSStyleRule) => isStyleRule(rule) && isRootSelector(rule));

      const properties = rules.reduce((allProperties: string[], rule: CSSStyleRule) => [
        ...allProperties,
        ...Array.from(rule.style)
          .filter(isColorProp)
          .map((prop) => prop.trim()),
      ], []);

      if (properties.length) {
        return [...acc, ...properties];
      }

      return acc;
    }, []);
}
```

Теперь нам нужно установить в стейт компонента результат работы нашей функции. Но сделать это можно только после монтирования компонента. В противном случае, DOM нам будет недоступен и мы не соберем никакие custom properties.

{% raw %}
```tsx
export const Colors = () => {
  const [properties, setProperties] = useState<string[]>([]);
  useEffect(() => {
    setProperties(getColorsFromCustomProperties());
  }, []);

  return (
    <table>
      {properties.map((prop) => (
        <tr key={prop}>
          <td>
            <div
              className="color-preview"
              style={{ backgroundColor: `var(${prop})` }}
            />
          </td>
          <td>
            <div className="property-name">{prop}</div>
          </td>
        </tr>
      ))}
    </table>
  );
};
```
{% endraw %}

Добавим щепотку стилей.
```css
.color-preview {
  width: 4em;
  height: 2em;
  border: solid 1px darkgray;
}

.property-name {
  padding: 0.5em;
  color: darkgray;
}
```

Вот что получилось.
{% image './src/posts/displaying-color-palette-in-storybook/color-palette-storybook-3.png', 'Вывод цветовой палитры' %}

Сделаем так, чтобы при клике по плашке цвета, в буфер обмена копировался сниппет, которым мы будем пользоваться при использовании данного цвета (например, `var(--primary-color)`).

{% raw %}
```tsx
export const Colors = () => {
  const [properties, setProperties] = useState<string[]>([]);
  useEffect(() => {
    setProperties(getColorsFromCustomProperties());
  }, []);

  const clickHandler = useCallback((e: MouseEvent<HTMLElement>) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText((e.target as HTMLElement).dataset.snippet);
    }
  }, []);

  return (
    <table>
      {properties.map((prop) => (
        <tr key={prop}>
          <td>
            <button
              data-snippet={`var(${prop})`}
              className="color-preview"
              style={{ backgroundColor: `var(${prop})` }}
              onClick={clickHandler}
            />
          </td>
          <td>
            <div className="property-name">{prop}</div>
          </td>
        </tr>
      ))}
    </table>
  );
};
```
{% endraw %}

Добавим возможность фильтрации.

{% raw %}
```tsx
export const Colors = () => {
  const [properties, setProperties] = useState<string[]>([]);
  const cache = useRef<string[]>([]);

  useEffect(() => {
    cache.current = getColorsFromCustomProperties();
    setProperties(cache.current);
  }, []);

  const filterHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    const filtered = cache.current.filter((prop) => prop.includes(value));
    setProperties(filtered);
  }, []);

  const clickHandler = useCallback((e: MouseEvent<HTMLElement>) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText((e.target as HTMLElement).dataset.snippet);
    }
  }, []);

  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Введите название цвета"
          onChange={filterHandler}
        />
      </div>
      <table>
        {properties.map((prop) => (
          <tr key={prop}>
            <td>
              <button
                data-snippet={`var(${prop})`}
                className="color-preview"
                style={{ backgroundColor: `var(${prop})` }}
                onClick={clickHandler}
              />
            </td>
            <td>
              <div className="property-name">{prop}</div>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
};
```
{% endraw %}

{% note 'Обратите внимание, что мы кешируем результаты работы функции <code>getColorsFromCustomProperties</code>, т.к. она достаточно «тяжелая» и нет никакой необходимости вызывать ее при каждом изменении значения в поле поиска.' %}

Вот, что у нас получилось.
{% image './src/posts/displaying-color-palette-in-storybook/color-palette-storybook-4.png', 'Пример работы фильтра' %}

