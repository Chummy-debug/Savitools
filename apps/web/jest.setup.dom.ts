import '@testing-library/jest-dom';

// jsdom does not implement `scrollIntoView`, which the command palette calls on
// the active option to keep it scrolled into view while arrowing through items.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  // Preferences and recent items are persisted in localStorage, which jsdom
  // keeps for the whole file by default. Reset it so suites stay independent.
  // Guarded because this project also runs pure-logic suites under the `node`
  // environment, where there is no window.
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
  }
});
