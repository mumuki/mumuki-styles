(function (window, document) {
  'use strict';

  window.mumuki = {};

  var hasTurbolinksGreaterOrEqualThanVersion5 = function () {
    return window.Turbolinks && !window.Turbolinks.EVENTS;
  }

  var hasTurbolinksLowerThanVersion5 = function () {
    return window.Turbolinks && window.Turbolinks.EVENTS && window.Turbolinks.EVENTS.LOAD;
  }

  mumuki.load = function (callback) {
    if (hasTurbolinksLowerThanVersion5()) {
      $(document).on('page:load', callback);
      $(document).ready(callback);
    } else if (hasTurbolinksGreaterOrEqualThanVersion5()) {
      $(document).on('turbolinks:load', callback);
    } else {
      $(document).ready(callback);
    }
  }

})(window, document);

