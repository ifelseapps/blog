---
title: Описание состояний интерфейса с помощью TypeScript
date: 2020-09-07
date_label: 2020-09-07
tags:
  - typescript
  - angular
  - рефакторинг
preview_text: В данной заметке мы попробуем распутать клубок условий и сделать код более читаемым, а также превратим TypeScript в нашего помощника.
keywords: typescript, angular, рефакторинг, конечные автоматы
---
На ревью я часто вижу код, который описывает состояния пользовательского интерфейса. Этот код содержит массу условий.

Для примера давайте рассмотрим код вывода списка пользователей.

{% note 'В этой статье мы будем рассматривать примеры на Angular, но все о чем тут говорится, можно применить при использовании любого фреймворка.' %}

```html
<ng-container *ngIf="isLoading && !error">
  Loading...
</ng-container>
<ul *ngIf="users && users.length && !error">
  <li *ngFor="let user of users">{{user.name}}</li>
</ul>
<ng-container *ngIf="!error && !loading && users && !users.length">
  Nothing found
</ng-container>
<ng-container *ngIf="!isLoading && error">
  {{error.message}}
</ng-container>
```

Из-за того, что данный код содержит массу различных флагов и их комбинаций, его тяжело читать и поддерживать.

Я предпочитаю другой подход. Давайте попробуем порефакторить этот код.

Я читал про _теорию конечных автоматов_. Конечный автомат принимает конечный набор состояний, и в один момент времени он находится в одном из
этих состояний.

Давайте выделим состояния, в которых может находиться список пользователей.

* Загрузка — необходимо показать прелоадер
* Пользователи загружены — необходимо вывести список
* Сервер вернул ошибку — необходимо вывести текст ошибки
* Список пользователей пуст (пользователи не найдены) — необходимо вывести соответствующее сообщение

Давайте зафиксируем указанные выше состояния в виде типа с применением
[discriminating union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions).

```typescript
type State =
  | { status: 'loading' }
  | { status: 'success', data: IUser[] }
  | { status: 'failed', error: Error }
  | { status: 'not-founded' };
```

Сделаем тип State универсальным с помощью [дженериков](/posts/ts-practice-generics/).

```typescript
type State<TSuccessData> =
  | { status: 'loading' }
  | { status: 'success', data: TSuccessData }
  | { status: 'failed', error: Error }
  | { status: 'not-founded' };

type UsersListState = State<IUser[]>;

```

Вот и все. Теперь можно переписать логику отображения.

```html
<ng-container *ngIf="state.status === 'loading'">
  Loading...
</ng-container>
<ul *ngIf="state.status === 'success'">
  <li *ngFor="let user of state.data">{{user.name}}</li>
</ul>
<ng-container *ngIf="state.status === 'not-found'">
  Nothing found
</ng-container>
<ng-container *ngIf="state.status === 'failed'">
  {{state.error.message}}
</ng-container>
```

Глядя на такой код, можно сразу понять какое состояние описывается. Этот код сам себя документирует. Кроме того, благодаря этому подходу,
вы получаете отличные подсказки в вашей IDE.

{% image './src/posts/describe-the-state-of-the-interface-using-typescript/example1.png', 'Пример подсказок в IDE', 'В <code>state.status</code> хранится не просто строка, а ограниченный набор значений, которые мы описали выше.' %}

{% image './src/posts/describe-the-state-of-the-interface-using-typescript/example2.png', 'Пример подсказок в IDE', 'TypeScript подсказывает IDE, что при <code>status === "success"</code>, в <code>state</code> доступны только поля <code>status</code> и <code>data</code>.' %}
