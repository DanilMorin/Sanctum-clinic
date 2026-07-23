import {
  completeQuizSession,
  createQuizSession,
  getQuestions,
  updateQuizAnswers,
} from '../../api.js';
import {
  renderCleansingGuideScreen,
  renderFinalScreen,
  renderLoadingScreen,
  renderQuestionScreen,
  renderResultScreen,
  renderWelcomeScreen,
} from '../../components/screens.js';
import { SCREEN } from '../../constants/quiz.js';
import { getCurrentUser } from '../../platform.js';
import {
  createInitialQuizState,
  getAnswerField,
  getCurrentQuestion,
  isMultipleQuestion,
  isQuestionAnswered,
  normalizeFeatureSelection,
} from './quiz-logic.js';

const DEFAULT_ERROR_MESSAGE =
  'Не удалось выполнить запрос. Попробуйте ещё раз.';

function getErrorMessage(error) {
  return error instanceof Error && error.message
    ? error.message
    : DEFAULT_ERROR_MESSAGE;
}

function createSessionPayload() {
  const currentUser = getCurrentUser();

  if (currentUser.telegramUser) {
    return { telegramUser: currentUser.telegramUser };
  }

  return {
    telegramUser: {
      telegramId: `local-${Date.now()}`,
    },
  };
}

export function createQuizController(rootElement) {
  let state = createInitialQuizState();

  function render() {
    switch (state.screen) {
      case SCREEN.loading:
        rootElement.innerHTML = renderLoadingScreen();
        break;
      case SCREEN.question:
        rootElement.innerHTML = renderQuestionScreen(state);
        break;
      case SCREEN.result:
        rootElement.innerHTML = renderResultScreen(state.result);
        break;
      case SCREEN.cleansingGuide:
        rootElement.innerHTML = renderCleansingGuideScreen();
        break;
      case SCREEN.final:
        rootElement.innerHTML = renderFinalScreen();
        break;
      default:
        rootElement.innerHTML = renderWelcomeScreen(state.error);
    }
  }

  function setState(patch) {
    state = {
      ...state,
      ...patch,
    };
    render();
  }

  async function startTest() {
    if (state.isLoading) {
      return;
    }

    state = {
      ...createInitialQuizState(),
      screen: SCREEN.loading,
      isLoading: true,
    };
    render();

    try {
      const questionsResponse = await getQuestions();

      if (!questionsResponse?.questions?.length) {
        throw new Error('Не удалось загрузить вопросы теста.');
      }

      const sessionResponse = await createQuizSession(createSessionPayload());

      if (!sessionResponse?.session?.id) {
        throw new Error('Не удалось создать сессию теста.');
      }

      setState({
        screen: SCREEN.question,
        questions: questionsResponse.questions,
        sessionId: sessionResponse.session.id,
        isLoading: false,
      });
    } catch (error) {
      state = {
        ...createInitialQuizState(),
        error: getErrorMessage(error),
      };
      render();
    }
  }

  function selectAnswer(selectedValue) {
    if (state.isLoading) {
      return;
    }

    const question = getCurrentQuestion(state);
    const answerField = getAnswerField(question);

    if (!answerField) {
      setState({ error: 'Не удалось определить текущий вопрос.' });
      return;
    }

    const currentAnswer = state.answers[answerField];
    const nextAnswer = isMultipleQuestion(question)
      ? normalizeFeatureSelection(currentAnswer, selectedValue)
      : selectedValue;

    setState({
      answers: {
        ...state.answers,
        [answerField]: nextAnswer,
      },
      error: null,
    });
  }

  async function goNext() {
    if (state.isLoading) {
      return;
    }

    const question = getCurrentQuestion(state);
    const answerField = getAnswerField(question);

    if (
      !answerField ||
      !state.sessionId ||
      !isQuestionAnswered(question, state.answers)
    ) {
      return;
    }

    const sessionId = state.sessionId;
    const currentStepIndex = state.currentStepIndex;
    const answer = state.answers[answerField];
    const isLastStep = currentStepIndex === state.questions.length - 1;

    setState({
      isLoading: true,
      error: null,
    });

    try {
      await updateQuizAnswers(sessionId, {
        [answerField]: answer,
      });

      if (isLastStep) {
        const result = await completeQuizSession(sessionId);

        setState({
          screen: SCREEN.result,
          result,
          isLoading: false,
        });
        return;
      }

      setState({
        currentStepIndex: currentStepIndex + 1,
        isLoading: false,
      });
    } catch (error) {
      setState({
        isLoading: false,
        error: getErrorMessage(error),
      });
    }
  }

  function goBack() {
    if (state.isLoading) {
      return;
    }

    if (state.currentStepIndex === 0) {
      state = createInitialQuizState();
      render();
      return;
    }

    setState({
      currentStepIndex: state.currentStepIndex - 1,
      error: null,
    });
  }

  function handleAction(action, actionElement) {
    switch (action) {
      case 'start-test':
        void startTest();
        break;
      case 'select-answer':
        selectAnswer(actionElement.dataset.value);
        break;
      case 'go-next':
        void goNext();
        break;
      case 'go-back':
        goBack();
        break;
      case 'return-to-quiz':
        setState({
          screen: SCREEN.question,
          result: null,
          currentStepIndex: Math.max(state.questions.length - 1, 0),
        });
        break;
      case 'show-cleansing-guide':
      case 'return-to-cleansing-guide':
        setState({ screen: SCREEN.cleansingGuide });
        break;
      case 'return-to-result':
        setState({ screen: SCREEN.result });
        break;
      case 'show-final':
        setState({ screen: SCREEN.final });
        break;
    }
  }

  function handleClick(event) {
    const actionElement = event.target.closest?.('[data-action]');

    if (!actionElement || !rootElement.contains(actionElement)) {
      return;
    }

    handleAction(actionElement.dataset.action, actionElement);
  }

  function mount() {
    rootElement.addEventListener('click', handleClick);
    render();
  }

  return { mount };
}
