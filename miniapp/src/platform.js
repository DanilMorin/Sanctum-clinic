export function getTelegramWebApp() {
  return window.Telegram?.WebApp || null;
}

export function getMaxWebApp() {
  return window.WebApp || null;
}

export function getPlatform() {
  if (getTelegramWebApp()) {
    return 'telegram';
  }

  if (getMaxWebApp()) {
    return 'max';
  }

  return 'browser';
}

export function initPlatform() {
  const telegram = getTelegramWebApp();

  if (telegram) {
    telegram.ready();
    telegram.expand();

    document.documentElement.style.setProperty(
      '--tg-bg-color',
      telegram.themeParams?.bg_color || '#ffffff',
    );

    document.documentElement.style.setProperty(
      '--tg-text-color',
      telegram.themeParams?.text_color || '#222222',
    );

    return;
  }

  const max = getMaxWebApp();

  if (max) {
    // MAX Bridge будет подключаться позже, когда начнём адаптацию под MAX.
    return;
  }
}

export function getCurrentUser() {
  const telegram = getTelegramWebApp();

  if (telegram?.initDataUnsafe?.user) {
    const user = telegram.initDataUnsafe.user;

    return {
      provider: 'telegram',
      telegramUser: {
        telegramId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  const max = getMaxWebApp();

  if (max?.initDataUnsafe?.user) {
    const user = max.initDataUnsafe.user;

    return {
      provider: 'max',
      maxUser: {
        maxId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  return {
    provider: 'browser',
    telegramUser: {
      telegramId: `local-${Date.now()}`,
      username: 'local_user',
      firstName: 'Local',
      lastName: 'User',
    },
  };
}
