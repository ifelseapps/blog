---
title: Группировка постов в 11ty
date: 2022-01-11
date_label: 2022-01-11
preview_text: В новом году я занялся активным наполнением раздела «путешествия». Мне захотелось сгруппировать поездки и перелинковать между собой.
tags:
- 11ty
---
Вдохновил меня на это [сайт Артемия Лебедева](https://tema.ru).
{% image './src/posts/grouping-posts-in-11ty/grouping-posts-11ty-1.png', 'Группировка поездок на сайте Артемия Лебедева' %}

Конечно, я не путешествую так много как Артемий. Поэтому мне достаточно вывести на странице поста ссылку вида `[месяц] [год]`.

Начнем с того, что добавим поле `group` для каждого поста, которые мы хотим сгруппировать и запишем туда название группы.

```markdown
---
title: Новогодний Санкт-Петербург
date: 2022-01-03
group: spb
---
```

```markdown
---
title: Осенний Петербург
date: 2019-11-02
group: spb
---
```

Нам придется создать новую коллекцию для того, чтобы получить доступ к collections API и иметь возможность мутировать объекты постов.

Дальше нам нужно два раза пробежаться по коллекции с путешествиями. Во время первого прохода мы сгруппируем посты. Именем группы как раз будет значение поля `group`. Для каждой группы мы будем хранить массив с датами и ссылками на посты.

Во время второго прохода мы добавим собранный ранее массив для каждого поста группы и перевернем его (для того, чтобы выводить посты в порядке убывания).

```javascript
  eleventyConfig.addCollection('travels', (collection) => {
    const travels = collection.getFilteredByTag('travel');

    const groups = travels.reduce((acc, item) => {
      if (!item.data.group) {
        return acc;
      }

      acc[item.data.group] = acc[item.data.group] || [];
      acc[item.data.group].push({
        date: item.date,
        link: item.url,
      });

      return acc;
    }, {});


    travels.forEach((item) => {
      if (item.data.group) {
        item.data.years = [...groups[item.data.group]].reverse();
      }
    });

    return travels;
  });
```

Осталось только вывести ссылки в шаблоне поста.
```liquid
{% raw %}
  {% if years %}
    <ul class="post-years">
      {% for item in years %}
        <li class="post-years__item">
            {% if page.url == item.link %}
                {{ item.date | date_month_year | capitalize }}
            {% else %}
                <a href="{{ item.link }}">{{ item.date | date_month_year | capitalize }}</a>
            {% endif %}
        </li>
      {% endfor %}
    </ul>
  {% endif %}
{% endraw %}
```

Вот что у нас получилось.
{% image './src/posts/grouping-posts-in-11ty/grouping-posts-11ty-2.png', 'Группировка постов', '', 'false' %}
