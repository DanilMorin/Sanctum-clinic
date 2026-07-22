import {
  completeQuizSession,
  createQuizSession,
  getQuestions,
  updateQuizAnswers,
} from './api.js';
import { getCurrentUser, initPlatform } from './platform.js';
import startImageUrl from './assets/img/start-image.png';
import logoUrl from './assets/img/logo.svg';
import arrowIconUrl from './assets/img/arrow-icon.svg';
import arrowIconLightUrl from './assets/img/arrow-icon-light.svg';
import './assets/scss/styles.scss';

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

const resultProfileLabels = {
  skinType: {
    oily: 'Жирная кожа',
    combination: 'Комбинированная кожа',
    dry: 'Сухая кожа',
  },
  skinFeatures: {
    acne: 'Акне / высыпания',
    rosacea: 'Розацеа',
    couperose: 'Купероз',
    pigmentation: 'Пигментация',
    sensitive: 'Чувствительная кожа',
    none: 'Без особенностей',
  },
  lifestyle: {
    active: 'Активный ритм',
    normal: 'Обычный ритм',
  },
  spfUsage: {
    makeup_base: 'Под макияж',
    standalone: 'Самостоятельный уход',
  },
  productFormat: {
    pharmacy: 'Рассмотрю аптечные варианты',
    professional: 'Рассмотрю профессиональные варианты',
    both: 'Рассмотрю аптечные и профессиональные варианты',
  },
};

function getResultProfileTags(answers) {
  const featureTags = answers.skinFeatures.map(
    (feature) => resultProfileLabels.skinFeatures[feature],
  );

  return [
    resultProfileLabels.skinType[answers.skinType],
    ...featureTags,
    resultProfileLabels.lifestyle[answers.lifestyle],
    resultProfileLabels.spfUsage[answers.spfUsage],
    resultProfileLabels.productFormat[answers.productFormat],
  ].filter(Boolean);
}

function formatSpfLabel(spf) {
  return spf?.replace(/SPF\s*(\d+)/i, 'SPF $1');
}

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

// 0 — welcome page
function renderWelcomeScreen() {
  app.innerHTML = `
    <!-- 0 — welcome page -->
    <section class="screen welcome">
      <img class="welcome__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <h1 class="welcome__title">
        SPF-тест<br />
        для подбора<br />
        солнцезащитного<br />
        средства
      </h1>

      <p class="welcome__description">
        Ответьте на 5 коротких вопросов — и получите<br />
        персональную рекомендацию, подобранную<br />
        с учётом особенностей вашей кожи
      </p>

      <button class="welcome__start" id="start-button" type="button">
        <span>Начать</span>
        <img src="${arrowIconUrl}" alt="" width="24" height="24" aria-hidden="true" />
      </button>

      <div class="welcome__image-section" aria-hidden="true">
        <img class="welcome__image" src="${startImageUrl}" alt="" width="461" height="558" />
      </div>
    </section>
  `;

  document.querySelector('#start-button').addEventListener('click', startTest);
}

// 1 — skin type page (first question state)
function renderQuestionScreen() {
  const question = getCurrentQuestion();
  const field = answerFieldByQuestionId[question.id];
  const selectedValue = state.answers[field];
  const isAnswered = isCurrentQuestionAnswered();
  const stepperProgress = state.questions.length > 1
    ? (state.currentStepIndex / (state.questions.length - 1)) * 100
    : 0;

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
          <span class="option__marker" aria-hidden="true"></span>
          <span class="option__copy">
            <strong class="option__label">${option.label}</strong>
            ${
              option.description
                ? `<small class="option__description">${option.description}</small>`
                : ''
            }
          </span>
        </button>
      `;
    })
    .join('');

  app.innerHTML = `
    <!-- 1 — skin type page -->
    <section class="screen question-page">
      <img class="question-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <div class="stepper" aria-label="Шаг ${state.currentStepIndex + 1} из ${state.questions.length}">
        <div class="stepper__row">
          <span class="stepper__track" aria-hidden="true">
            <span class="stepper__fill" style="width: ${stepperProgress}%"></span>
          </span>

          ${state.questions
            .map(
              (item, index) => `
                <span
                  class="stepper__step ${index === state.currentStepIndex ? 'stepper__step--active' : ''}"
                  aria-current="${index === state.currentStepIndex ? 'step' : 'false'}"
                >
                  ${index + 1}
                </span>
              `,
            )
            .join('')}
        </div>
        <p class="stepper__label">${question.progressLabel}</p>
      </div>

      <div class="question-copy">
        <h1 class="question-copy__title">${question.title}</h1>
        <p class="question-copy__hint">Выберите ${isMultipleQuestion(question) ? 'один или несколько вариантов' : 'один вариант'}</p>
      </div>

      <div class="options">
        ${optionsHtml}
      </div>

      ${state.error ? `<p class="error">${state.error}</p>` : ''}

      <div class="question-page__spacer"></div>

      <nav class="question-actions" aria-label="Навигация по тесту">
        <button class="question-actions__back" id="back-button" type="button" aria-label="Назад">
          <img src="${arrowIconLightUrl}" alt="" width="24" height="24" aria-hidden="true" />
        </button>

        <button
          class="question-actions__next"
          id="next-button"
          type="button"
          ${!isAnswered || state.loading ? 'disabled' : ''}
        >
          <span>${state.loading ? 'Загрузка...' : 'Далее'}</span>
          <img src="${isAnswered ? arrowIconUrl : arrowIconLightUrl}" alt="" width="24" height="24" aria-hidden="true" />
        </button>
      </nav>
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

// 6 — result page
function renderResultScreen() {
  const result = state.result;
  const recommendation = result.recommendation;
  const profileTags = getResultProfileTags(result.answers);
  const priorityFeature = recommendation.priorityFeature;
  const priorityLabel = resultProfileLabels.skinFeatures[priorityFeature];
  const mainProduct = recommendation.mainProduct;
  const professionalProduct = recommendation.professionalProduct;
  const mainProductTags = mainProduct
    ? [
        formatSpfLabel(mainProduct.spf),
        mainProduct.texture
          ? `${mainProduct.texture}${mainProduct.texture.toLowerCase().includes('текстур') ? '' : ' текстура'}`
          : null,
        mainProduct.isMakeupBase === null
          ? null
          : `Под макияж: ${mainProduct.isMakeupBase ? 'да' : 'нет'}`,
      ].filter(Boolean)
    : [];

  app.innerHTML = `
    <!-- 6 — result page -->
    <section class="screen result-page">
      <img class="result-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <h1 class="result-page__title">Ваша персональная<br />рекомендация</h1>

      <section class="result-section result-profile">
        <h2 class="result-section__title">Ваш профиль</h2>
        <div class="result-tags">
          ${profileTags.map((tag) => `<span class="result-tag">${tag}</span>`).join('')}
        </div>
        <p class="result-profile__note">
          ${
            priorityFeature === 'none'
              ? 'Подбор выполнен без дополнительного приоритета:<br />особенности кожи не отмечены.'
              : `Приоритет подбора: ${priorityLabel}.`
          }
        </p>
      </section>

      ${
        mainProduct
          ? `
            <article class="result-section result-section--divided result-product">
              <h2 class="result-section__title">Основная рекомендация</h2>
              <h3 class="result-product__name">${mainProduct.name}</h3>
              ${
                mainProductTags.length
                  ? `<div class="result-tags">${mainProductTags.map((tag) => `<span class="result-tag">${tag}</span>`).join('')}</div>`
                  : ''
              }
              ${mainProduct.description ? `<p class="result-product__description">${mainProduct.description}</p>` : ''}
            </article>
          `
          : ''
      }

      ${
        recommendation.alternatives.length
          ? `
            <section class="result-section result-section--divided result-alternatives">
              <h2 class="result-section__title">Также подходят</h2>
              <div class="result-alternatives__list">
                ${recommendation.alternatives
                  .map((product) => `<p>${product.name}</p>`)
                  .join('')}
              </div>
            </section>
          `
          : ''
      }

      ${
        professionalProduct
          ? `
            <article class="result-section result-section--divided result-professional">
              <h2 class="result-section__title">Профессиональный<br />вариант</h2>
              <h3 class="result-product__name">${professionalProduct.name}</h3>
              ${
                professionalProduct.doctorComment || professionalProduct.description
                  ? `<p class="result-professional__description">${professionalProduct.doctorComment || professionalProduct.description}</p>`
                  : ''
              }
            </article>
          `
          : ''
      }

      <aside class="result-disclaimer">
        <h2>Важно</h2>
        <p>Если вы беременны, кормите грудью или принимаете системные ретиноиды, перед использованием SPF проконсультируйтесь с вашим врачом.</p>
      </aside>

      <nav class="result-actions" aria-label="Навигация по результам">
        <button class="result-actions__back" id="result-back-button" type="button" aria-label="Назад">
          <img src="${arrowIconLightUrl}" alt="" width="18" height="14" aria-hidden="true" />
        </button>
        <span class="result-actions__guide">
          Правильный смыв SPF
          <img src="${arrowIconLightUrl}" alt="" width="18" height="14" aria-hidden="true" />
        </span>
      </nav>
    </section>
  `;

  document.querySelector('#result-back-button').addEventListener('click', () => {
    setState({
      result: null,
      currentStepIndex: Math.max(state.questions.length - 1, 0),
    });
  });
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
