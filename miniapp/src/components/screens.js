import startImageUrl from '../assets/img/start-image.png';
import finalImageUrl from '../assets/img/final-image.png';
import logoUrl from '../assets/img/logo.svg';
import arrowIconUrl from '../assets/img/arrow-icon.svg';
import arrowIconLightUrl from '../assets/img/arrow-icon-light.svg';
import { RESULT_PROFILE_LABELS } from '../constants/quiz.js';
import {
  getAnswerField,
  getCurrentQuestion,
  getProductTags,
  getResultProfileTags,
  isMultipleQuestion,
  isQuestionAnswered,
} from '../features/quiz/quiz-logic.js';
import { escapeHtml } from '../utils/html.js';

function renderError(error) {
  return error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : '';
}

function renderTags(tags) {
  return tags
    .map((tag) => `<span class="result-tag">${escapeHtml(tag)}</span>`)
    .join('');
}

function renderResultGuideButton({ className, iconUrl, markerAttribute }) {
  return `
    <button
      class="${className}"
      data-action="show-cleansing-guide"
      ${markerAttribute}
      type="button"
    >
      Как правильно смывать SPF
      <img src="${iconUrl}" alt="" width="18" height="14" aria-hidden="true" />
    </button>
  `;
}

function renderQuestionOptions(question, selectedAnswer, isLoading) {
  const optionTypeClass = isMultipleQuestion(question)
    ? 'option--multiple'
    : '';

  return question.options
    .map((option) => {
      const isSelected = Array.isArray(selectedAnswer)
        ? selectedAnswer.includes(option.value)
        : selectedAnswer === option.value;

      return `
        <button
          class="option ${optionTypeClass} ${isSelected ? 'option--selected' : ''}"
          data-action="select-answer"
          data-value="${escapeHtml(option.value)}"
          type="button"
          aria-pressed="${isSelected}"
          ${isLoading ? 'disabled' : ''}
        >
          <span class="option__marker" aria-hidden="true"></span>
          <span class="option__copy">
            <strong class="option__label">${escapeHtml(option.label)}</strong>
            ${
              option.description
                ? `<small class="option__description">${escapeHtml(option.description)}</small>`
                : ''
            }
          </span>
        </button>
      `;
    })
    .join('');
}

function getQuestionHint(question) {
  if (question.id === 'lifestyle') {
    return 'Выберите наиболее подходящий вариант';
  }

  return isMultipleQuestion(question)
    ? 'Выберите один или несколько вариантов'
    : 'Выберите один вариант';
}

function renderStepper(questions, currentStepIndex, progressLabel) {
  const stepperProgress =
    questions.length > 1
      ? (currentStepIndex / (questions.length - 1)) * 100
      : 0;

  const steps = questions
    .map(
      (_question, index) => `
        <span
          class="stepper__step ${index === currentStepIndex ? 'stepper__step--active' : ''}"
          ${index === currentStepIndex ? 'aria-current="step"' : ''}
        >
          ${index + 1}
        </span>
      `,
    )
    .join('');

  return `
    <div class="stepper" aria-label="Шаг ${currentStepIndex + 1} из ${questions.length}">
      <div class="stepper__row">
        <span class="stepper__track" aria-hidden="true">
          <span class="stepper__fill" style="width: ${stepperProgress}%"></span>
        </span>
        ${steps}
      </div>
      <p class="stepper__label">${escapeHtml(progressLabel)}</p>
    </div>
  `;
}

export function renderWelcomeScreen(error) {
  return `
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

      ${renderError(error)}

      <button class="welcome__start" id="start-button" data-action="start-test" type="button">
        <span>${error ? 'Попробовать снова' : 'Начать'}</span>
        <img src="${arrowIconUrl}" alt="" width="24" height="24" aria-hidden="true" />
      </button>

      <div class="welcome__image-section" aria-hidden="true">
        <img class="welcome__image" src="${startImageUrl}" alt="" width="461" height="558" />
      </div>
    </section>
  `;
}

export function renderLoadingScreen() {
  return `
    <section class="screen screen--center" aria-live="polite">
      <div class="card">
        <p>Загрузка...</p>
      </div>
    </section>
  `;
}

export function renderQuestionScreen(state) {
  const question = getCurrentQuestion(state);
  const answerField = getAnswerField(question);
  const selectedAnswer = state.answers[answerField];
  const isAnswered = isQuestionAnswered(question, state.answers);

  return `
    <section class="screen question-page">
      <img class="question-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      ${renderStepper(state.questions, state.currentStepIndex, question.progressLabel)}

      <div class="question-copy">
        <h1 class="question-copy__title">${escapeHtml(question.title)}</h1>
        <p class="question-copy__hint">${getQuestionHint(question)}</p>
      </div>

      <div class="options">
        ${renderQuestionOptions(question, selectedAnswer, state.isLoading)}
      </div>

      ${
        question.id === 'skin_features'
          ? `
            <p class="question-copy__hint question-page__selection-note">
              «Без особенностей» нельзя сочетать<br />
              с другими вариантами
            </p>
          `
          : ''
      }

      ${renderError(state.error)}

      <div class="question-page__spacer"></div>

      <nav class="question-actions" aria-label="Навигация по тесту">
        <button
          class="question-actions__back"
          id="back-button"
          data-action="go-back"
          type="button"
          aria-label="Назад"
          ${state.isLoading ? 'disabled' : ''}
        >
          <img src="${arrowIconLightUrl}" alt="" width="24" height="24" aria-hidden="true" />
        </button>

        <button
          class="question-actions__next"
          id="next-button"
          data-action="go-next"
          type="button"
          ${!isAnswered || state.isLoading ? 'disabled' : ''}
        >
          <span>${state.isLoading ? 'Загрузка...' : 'Далее'}</span>
          <img src="${isAnswered ? arrowIconUrl : arrowIconLightUrl}" alt="" width="24" height="24" aria-hidden="true" />
        </button>
      </nav>
    </section>
  `;
}

export function renderResultScreen(result) {
  const { answers, recommendation } = result;
  const profileTags = getResultProfileTags(answers);
  const priorityFeature = recommendation.priorityFeature;
  const priorityLabel =
    RESULT_PROFILE_LABELS.skinFeatures[priorityFeature] ?? priorityFeature;
  const mainProduct = recommendation.mainProduct;
  const professionalProduct = recommendation.professionalProduct;
  const alternatives = recommendation.alternatives ?? [];
  const mainProductTags = getProductTags(mainProduct);

  return `
    <section class="screen result-page">
      <img class="result-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <h1 class="result-page__title">Ваша персональная<br />рекомендация</h1>

      <section class="result-section result-profile">
        <h2 class="result-section__title">Ваш профиль</h2>
        <div class="result-tags">${renderTags(profileTags)}</div>
        <p class="result-profile__note">
          ${
            priorityFeature === 'none'
              ? 'Подбор выполнен без дополнительного приоритета:<br />особенности кожи не отмечены.'
              : `Приоритет подбора: ${escapeHtml(priorityLabel)}.`
          }
        </p>
      </section>

      ${
        mainProduct
          ? `
            <article class="result-section result-section--divided result-product">
              <h2 class="result-section__title">Основная рекомендация</h2>
              <h3 class="result-product__name">${escapeHtml(mainProduct.name)}</h3>
              ${
                mainProductTags.length
                  ? `<div class="result-tags">${renderTags(mainProductTags)}</div>`
                  : ''
              }
              ${
                mainProduct.description
                  ? `<p class="result-product__description">${escapeHtml(mainProduct.description)}</p>`
                  : ''
              }
            </article>
          `
          : ''
      }

      ${
        alternatives.length
          ? `
            <section class="result-section result-section--divided result-alternatives">
              <h2 class="result-section__title">Также подходят</h2>
              <div class="result-alternatives__list">
                ${alternatives
                  .map((product) => `<p>${escapeHtml(product.name)}</p>`)
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
              <h2 class="result-section__title">Профессиональный вариант</h2>
              <div class="result-professional__content">
                <h3 class="result-product__name">${escapeHtml(professionalProduct.name)}</h3>
                ${
                  professionalProduct.doctorComment ||
                  professionalProduct.description
                    ? `<p class="result-professional__description">${escapeHtml(
                        professionalProduct.doctorComment ||
                          professionalProduct.description,
                      )}</p>`
                    : ''
                }
              </div>
            </article>
          `
          : ''
      }

      <aside class="result-disclaimer">
        <h2>Важно</h2>
        <p>Если вы беременны, кормите грудью или принимаете системные ретиноиды, перед использованием SPF проконсультируйтесь с вашим врачом.</p>
      </aside>

      <nav class="result-actions" aria-label="Навигация по результатам">
        <button class="result-actions__back" id="result-back-button" data-action="return-to-quiz" type="button" aria-label="Назад">
          <img src="${arrowIconLightUrl}" alt="" width="18" height="14" aria-hidden="true" />
        </button>
        ${renderResultGuideButton({
          className: 'result-actions__guide',
          iconUrl: arrowIconLightUrl,
          markerAttribute: 'data-result-guide-end',
        })}
      </nav>

      <div class="result-guide-prompt" data-result-guide-fixed>
        ${renderResultGuideButton({
          className: 'result-guide-prompt__button',
          iconUrl: arrowIconUrl,
          markerAttribute: '',
        })}
      </div>
    </section>
  `;
}

export function renderCleansingGuideScreen() {
  return `
    <section class="screen cleansing-page">
      <img class="cleansing-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <h1 class="cleansing-page__title">SPF важно<br />правильно смывать</h1>

      <p class="cleansing-page__intro">
        Остатки солнцезащитных средств,<br />
        особенно плотных формул, могут забивать поры<br />
        и снижать эффективность последующего ухода.
      </p>

      <h2 class="cleansing-page__subtitle">Как очищать кожу вечером</h2>

      <div class="cleansing-steps">
        <article class="cleansing-step">
          <span class="cleansing-step__number">01</span>
          <div class="cleansing-step__copy">
            <h3>Первый этап</h3>
            <p>Гидрофильное масло, бальзам или<br />мицеллярная вода.</p>
          </div>
        </article>

        <article class="cleansing-step">
          <span class="cleansing-step__number">02</span>
          <div class="cleansing-step__copy">
            <h3>Второй этап</h3>
            <p>Мягкий гель или пенка, подходящие<br />вашему типу кожи.</p>
          </div>
        </article>

        <article class="cleansing-step">
          <span class="cleansing-step__number">03</span>
          <div class="cleansing-step__copy">
            <h3>Завершение ухода</h3>
            <p>Нанесите привычные увлажняющие<br />средства.</p>
          </div>
        </article>
      </div>

      <div class="cleansing-page__spacer"></div>

      <aside class="hydrafacial-card">
        <h2>HydraFacial</h2>
        <p>Аппаратная процедура помогает провести<br />глубокое очищение и дополнить домашний уход.</p>
        <button class="hydrafacial-card__action" id="final-page-button" data-action="show-final" type="button">
          Подробнее о HydraFacial
          <img src="${arrowIconUrl}" alt="" width="18" height="14" aria-hidden="true" />
        </button>
      </aside>

      <button class="cleansing-page__back" id="cleansing-back-button" data-action="return-to-result" type="button" aria-label="Назад">
        <img src="${arrowIconLightUrl}" alt="" width="18" height="14" aria-hidden="true" />
      </button>
    </section>
  `;
}

export function renderFinalScreen() {
  return `
    <section class="screen final-page">
      <img class="final-page__portrait" src="${finalImageUrl}" alt="" width="392" height="647" aria-hidden="true" />
      <div class="final-page__fade" aria-hidden="true"></div>

      <img class="final-page__logo" src="${logoUrl}" alt="Sanctum" width="167" height="23" />

      <h1 class="final-page__title">Спасибо<br />за прохождение!</h1>

      <button class="final-page__restart" id="final-restart-button" data-action="start-test" type="button">
        <span>Пройти ещё раз</span>
        <img src="${arrowIconUrl}" alt="" width="18" height="14" aria-hidden="true" />
      </button>

      <button class="final-page__back" id="final-back-button" data-action="return-to-cleansing-guide" type="button" aria-label="Назад">
        <img src="${arrowIconLightUrl}" alt="" width="18" height="14" aria-hidden="true" />
      </button>
    </section>
  `;
}
