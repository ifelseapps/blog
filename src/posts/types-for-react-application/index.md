---
title: Практика TypeScript. Типизируем React-приложение.
date: 2022-11-22
date_label: 2022-11-22
is_favorite: true
tags:
  - typescript
  - react
keywords: typescript, практика typescript, react
preview_text: Попробуем применить TypeScript для типизации React-приложения. Попробуем реализовать чуть более сложные вещи, чем типизация стейта и пропсов.
---

Все статьи цикла:

- [Практика TypeScript. Generics.](/posts/ts-practice-generics/)
- **Практика TypeScript. Типизируем React-приложение**

# Типизация функционального компонента

Начнем с простого. Типизируем функциональный компонент. Однако, и тут не все так просто. Есть несколько способов это сделать. Разберем каждый из них.

```typescript
import React, { FC } from 'react';

type FooProps = {
  bar: string;
};

// Способ 1
const Foo = (props: FooProps): JSX.Element => <div>{props.bar}</div>;

// Способ 2
const Foo: FC<FooProps> = (props) => <div>{props.bar}</div>;
```

Честно говоря, я довольно длительное время пользовался вторым способом. Однако, на днях я увидел, что использование `React.FC` выпили из `create-react-app`. Я посмотрел этот [PR](https://github.com/facebook/create-react-app/pull/8177) и согласился с доводами автора. Взгляните на эти доводы:

- Сигнатура этого типа говорит нам о том, что все компоненты с типом `React.FC` принимают пропс `children`, хотя, далеко не все компоненты содержат в себе логику обработки этого пропса. Однако, **в 18 версии тайпингов это исправили** и `React.FC` больше не содержит пропс `children` по умолчанию.
