import '@testing-library/jest-dom';

// jsdom does not implement `scrollIntoView`, which the command palette calls on
// the active option to keep it scrolled into view while arrowing through items.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
