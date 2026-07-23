import { createQuizController } from './features/quiz/quiz-controller.js';
import { initPlatform } from './platform.js';
import './assets/scss/styles.scss';

const app = document.querySelector('#app');

if (!app) {
  throw new Error('Не найден корневой элемент приложения #app.');
}

initPlatform();
createQuizController(app).mount();
