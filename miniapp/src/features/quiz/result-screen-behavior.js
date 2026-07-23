const SCROLL_END_TOLERANCE_PX = 1;

export function isPageScrolledToEnd({
  viewportHeight,
  scrollOffset,
  pageHeight,
}) {
  return viewportHeight + scrollOffset >= pageHeight - SCROLL_END_TOLERANCE_PX;
}

export function initResultScreenBehavior(
  rootElement,
  browserWindow = window,
  pageDocument = document,
) {
  const fixedGuide = rootElement.querySelector('[data-result-guide-fixed]');
  const endGuide = rootElement.querySelector('[data-result-guide-end]');

  if (!fixedGuide || !endGuide) {
    return () => {};
  }

  function updateGuideState() {
    const scrollingElement =
      pageDocument.scrollingElement ?? pageDocument.documentElement;
    const isAtPageEnd = isPageScrolledToEnd({
      viewportHeight: browserWindow.innerHeight,
      scrollOffset: scrollingElement.scrollTop,
      pageHeight: scrollingElement.scrollHeight,
    });

    fixedGuide.hidden = isAtPageEnd;
    fixedGuide.setAttribute('aria-hidden', String(isAtPageEnd));
    endGuide.setAttribute('aria-hidden', String(!isAtPageEnd));
    endGuide.tabIndex = isAtPageEnd ? 0 : -1;
  }

  browserWindow.addEventListener('scroll', updateGuideState, {
    passive: true,
  });
  browserWindow.addEventListener('resize', updateGuideState);
  updateGuideState();

  return () => {
    browserWindow.removeEventListener('scroll', updateGuideState);
    browserWindow.removeEventListener('resize', updateGuideState);
  };
}
