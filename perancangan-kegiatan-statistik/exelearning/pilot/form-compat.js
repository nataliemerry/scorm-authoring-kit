/* Preserve native Form text decoding across eXeLearning platform exports. */
(() => {
  'use strict';
  const form = window.$form;
  if (!form || form.lcmTextCompatibility) return;
  const original = form.getProcessTextSelectionQuestion;
  if (typeof original !== 'function') return;
  form.getProcessTextSelectionQuestion = function (baseText, ...args) {
    if (typeof baseText === 'string') {
      baseText = baseText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }
    return original.call(this, baseText, ...args);
  };
  form.lcmTextCompatibility = true;
})();
