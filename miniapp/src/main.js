import {
  completeQuizSession,
  createQuizSession,
  getQuestions,
  updateQuizAnswers,
} from './api.js';
import { getCurrentUser, initPlatform } from './platform.js';
import './styles.css';

const app = document.querySelector('#app');

const state = {
  questions: [],
  sessionId: null,
  currentStepIndex: 0,
  answers: {
    skinType: undefined,
    skinFeatures: [],
    lifestyle: undefined,
    spfUsage: undefined,
    productFormat: undefined,
  },
  result: null,
  loading: false,
  error: null,
};

const answerFieldByQuestionId = {
  skin_type: 'skinType',
  skin_features: 'skinFeatures',
  lifestyle: 'lifestyle',
  spf_usage: 'spfUsage',
  product_format: 'productFormat',
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function getCurrentQuestion() {
  return state.questions[state.currentStepIndex];
}

function isMultipleQuestion(question) {
  return question?.type === 'multiple';
}

function isCurrentQuestionAnswered() {
  const question = getCurrentQuestion();

  if (!question) {
    return false;
  }

  const field = answerFieldByQuestionId[question.id];
  const value = state.answers[field];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(value);
}

function getProgressPercent() {
  if (!state.questions.length) {
    return 0;
  }

  return ((state.currentStepIndex + 1) / state.questions.length) * 100;
}

function normalizeFeatureSelection(currentFeatures, selectedFeature) {
  const hasFeature = currentFeatures.includes(selectedFeature);

  if (selectedFeature === 'none') {
    return hasFeature ? [] : ['none'];
  }

  const withoutNone = currentFeatures.filter((feature) => feature !== 'none');

  if (hasFeature) {
    return withoutNone.filter((feature) => feature !== selectedFeature);
  }

  return [...withoutNone, selectedFeature];
}

async function startTest() {
  try {
    setState({
      loading: true,
      error: null,
      currentStepIndex: 0,
      result: null,
      answers: {
        skinType: undefined,
        skinFeatures: [],
        lifestyle: undefined,
        spfUsage: undefined,
        productFormat: undefined,
      },
    });

    const questionsResponse = await getQuestions();
    const currentUser = getCurrentUser();

    const sessionPayload = currentUser.telegramUser
      ? { telegramUser: currentUser.telegramUser }
      : { telegramUser: { telegramId: `local-${Date.now()}` } };

    const sessionResponse = await createQuizSession(sessionPayload);

    setState({
      questions: questionsResponse.questions,
      sessionId: sessionResponse.session.id,
      loading: false,
    });
  } catch (error) {
    setState({
      loading: false,
      error: error.message,
    });
  }
}

function selectAnswer(value) {
  const question = getCurrentQuestion();
  const field = answerFieldByQuestionId[question.id];

  if (isMultipleQuestion(question)) {
    state.answers[field] = normalizeFeatureSelection(state.answers[field], value);
  } else {
    state.answers[field] = value;
  }

  render();
}

async function goNext() {
  const question = getCurrentQuestion();
  const field = answerFieldByQuestionId[question.id];

  try {
    setState({
      loading: true,
      error: null,
    });

    await updateQuizAnswers(state.sessionId, {
      [field]: state.answers[field],
    });

    const isLastStep = state.currentStepIndex === state.questions.length - 1;

    if (isLastStep) {
      const resultResponse = await completeQuizSession(state.sessionId);

      setState({
        loading: false,
        result: resultResponse,
      });

      return;
    }

    setState({
      loading: false,
      currentStepIndex: state.currentStepIndex + 1,
    });
  } catch (error) {
    setState({
      loading: false,
      error: error.message,
    });
  }
}

function goBack() {
  if (state.currentStepIndex === 0) {
    renderWelcomeScreen();
    return;
  }

  setState({
    currentStepIndex: state.currentStepIndex - 1,
  });
}

function renderWelcomeScreen() {
  app.innerHTML = `
    <section class="screen screen--center">
      <div class="card welcome-card">
        <div class="dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <h1>Подберём ваш идеальный SPF</h1>

        <p>
          Ответьте на 5 коротких вопросов — и получите персональную рекомендацию,
          подобранную с учётом особенностей вашей кожи.
        </p>

        <button class="button button--primary" id="start-button">
          Начать подбор
        </button>
      </div>
    </section>
  `;

  document.querySelector('#start-button').addEventListener('click', startTest);
}

function renderQuestionScreen() {
  const question = getCurrentQuestion();
  const field = answerFieldByQuestionId[question.id];
  const selectedValue = state.answers[field];

  const optionsHtml = question.options
    .map((option) => {
      const selected = Array.isArray(selectedValue)
        ? selectedValue.includes(option.value)
        : selectedValue === option.value;

      return `
        <button
          class="option ${selected ? 'option--selected' : ''}"
          data-value="${option.value}"
          type="button"
        >
          <span class="option__marker"></span>
          <span>
            <strong>${option.label}</strong>
            ${
              option.description
                ? `<small>${option.description}</small>`
                : ''
            }
          </span>
        </button>
      `;
    })
    .join('');

  app.innerHTML = `
    <section class="screen">
      <div class="quiz">
        <div class="progress-labels">
          ${state.questions
            .map(
              (item, index) => `
                <span class="${index === state.currentStepIndex ? 'active' : ''}">
                  ${item.progressLabel}
                </span>
              `,
            )
            .join('')}
        </div>

        <div class="progress">
          <div class="progress__bar" style="width: ${getProgressPercent()}%"></div>
        </div>

        <h2>${question.title}</h2>
        <p class="question-hint">Выберите ${isMultipleQuestion(question) ? 'один или несколько вариантов' : 'один вариант'}</p>

        <div class="options">
          ${optionsHtml}
        </div>

        ${
          state.error
            ? `<p class="error">${state.error}</p>`
            : ''
        }

        <div class="actions">
          <button class="button button--ghost" id="back-button" type="button">
            ← Назад
          </button>

          <button
            class="button button--primary"
            id="next-button"
            type="button"
            ${!isCurrentQuestionAnswered() || state.loading ? 'disabled' : ''}
          >
            ${state.loading ? 'Загрузка...' : 'Далее'}
          </button>
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll('.option').forEach((button) => {
    button.addEventListener('click', () => {
      selectAnswer(button.dataset.value);
    });
  });

  document.querySelector('#next-button').addEventListener('click', goNext);
  document.querySelector('#back-button').addEventListener('click', goBack);
}

function renderResultScreen() {
  const result = state.result;
  const recommendation = result.recommendation;

  app.innerHTML = `
    <section class="screen">
      <div class="card result-card">
        <h1>Ваш результат</h1>

        <p class="muted">
          Приоритетная особенность:
          <strong>${result.answers.priorityFeature}</strong>
        </p>

        ${
          recommendation.mainProduct
            ? `
              <article class="product-card">
                <h2>Основная рекомендация</h2>
                <strong>${recommendation.mainProduct.name}</strong>
                <p>${recommendation.mainProduct.brand || ''}</p>
                <p>${recommendation.mainProduct.spf || ''}</p>
              </article>
            `
            : ''
        }

        ${
          recommendation.alternatives.length
            ? `
              <article class="product-card">
                <h2>Также подходят</h2>
                <ul>
                  ${recommendation.alternatives
                    .map((product) => `<li>${product.name}</li>`)
                    .join('')}
                </ul>
              </article>
            `
            : ''
        }

        ${
          recommendation.professionalProduct
            ? `
              <article class="product-card">
                <h2>Профессиональный вариант</h2>
                <strong>${recommendation.professionalProduct.name}</strong>
                <p>${recommendation.professionalProduct.brand || ''}</p>
                <p>${recommendation.professionalProduct.spf || ''}</p>
              </article>
            `
            : ''
        }

        <p class="disclaimer">
          Если вы беременны, кормите грудью или принимаете системные ретиноиды,
          перед использованием солнцезащитного средства проконсультируйтесь с вашим врачом.
        </p>

        <button class="button button--primary" id="restart-button">
          Пройти заново
        </button>
      </div>
    </section>
  `;

  document.querySelector('#restart-button').addEventListener('click', startTest);
}

function renderLoadingScreen() {
  app.innerHTML = `
    <section class="screen screen--center">
      <div class="card">
        <p>Загрузка...</p>
      </div>
    </section>
  `;
}

function render() {
  if (state.loading && !state.questions.length) {
    renderLoadingScreen();
    return;
  }

  if (state.result) {
    renderResultScreen();
    return;
  }

  if (state.questions.length) {
    renderQuestionScreen();
    return;
  }

  renderWelcomeScreen();
}

initPlatform();
render();