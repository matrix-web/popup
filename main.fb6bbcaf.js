// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/main.js":[function(require,module,exports) {
var taxDeductionButton = document.querySelector('#tax-deduction-button');
var popupOverlay = document.querySelector('#popup-overlay');
var popup = document.querySelector('#popup');
var popupInfo = document.querySelector('#popup-info');
var salaryInput = document.querySelector('#salary');
var calculateButton = document.querySelector('#calculate-button');
var errorObject = {};
var closing = false;
taxDeductionButton.addEventListener('click', openPopup);
popup.addEventListener('click', closePopup);
popupOverlay.addEventListener('click', closePopup);
document.addEventListener('keyup', closePopup);
salaryInput.addEventListener('input', salaryUpdate);
salaryInput.addEventListener('keydown', salaryUpdate);
salaryInput.addEventListener('change', function (event) {
  var inputField = event.target;
  errorObject = validateFeild(inputField);
  setTimeout(function () {
    renderError(errorObject, {
      whereSelector: '#salary-label',
      position: 'beforeend',
      inputField: inputField
    });
  }, 0);
});
calculateButton.addEventListener('click', function () {
  errorObject = validateFeild(salaryInput);

  if (!errorObject.invalid) {
    var taxDeductions = calculationTaxDeduction();
    renderTaxDeductionContainer({
      where: calculateButton,
      position: 'afterend'
    });
    setTimeout(function () {
      var taxDeductionContainer = document.querySelector('#tax-deductions-container');
      var taxDeductionContainerIsExists = document.body.contains(taxDeductionContainer);

      if (window.matchMedia("(max-width: 340px)").matches && taxDeductionContainerIsExists) {
        popupInfo.style.marginBottom = '3.33rem';
      }
    }, 0);
    renderTaxDeductionItem({
      taxDeductions: taxDeductions,
      where: document.querySelector('#tax-deduction-list'),
      position: 'beforeend',
      formatSalary: formatSalary,
      declineEndings: declineEndings
    });
  } else {
    renderError(errorObject, {
      whereSelector: '#salary-label',
      position: 'beforeend',
      inputField: salaryInput
    });
  }
});
window.addEventListener('resize', function () {
  var taxDeductionContainer = document.querySelector('#tax-deductions-container');
  var taxDeductionContainerIsExists = document.body.contains(taxDeductionContainer);

  if (window.matchMedia('(min-width: 400px)').matches && !taxDeductionContainerIsExists || window.matchMedia('max-width: 340px') && taxDeductionContainerIsExists) {
    popupInfo.style.marginBottom = '2.86rem';
  } else {
    popupInfo.style.marginBottom = '12.7rem';
  }
});

function calculationTaxDeduction() {
  if (!errorObject.errors.length && !errorObject.invalid) {
    var monthSalary = +salaryInput.value.trim().replaceAll(/\D/g, '');
    var maxDeductionAmount = 260000;
    var totalTaxDeduction = 0;
    var year = 1;
    var taxDeductions = [];

    while (totalTaxDeduction < maxDeductionAmount) {
      var taxDeductionPerYear = monthSalary * 12 * .13;
      totalTaxDeduction += taxDeductionPerYear;

      if (totalTaxDeduction < maxDeductionAmount) {
        taxDeductions.push({
          amountPerYear: taxDeductionPerYear,
          year: year++
        });
      } else {
        taxDeductionPerYear = maxDeductionAmount - (totalTaxDeduction - taxDeductionPerYear);
        taxDeductions.push({
          amountPerYear: taxDeductionPerYear,
          year: year++
        });
      }
    }

    return taxDeductions;
  }
}

function validateFeild(field) {
  var monthSalary = +field.value.trim().replaceAll(/\D/g, '');
  var MROT = 12800;

  var required = function required(val) {
    return !!val;
  };

  var minValue = function minValue(num) {
    return function (val) {
      return num >= val;
    };
  };

  var errors = [];

  if (!required(monthSalary)) {
    errors.push({
      type: 'empty',
      error: 'Поле обязательно для заполнения'
    });
  } else if (!minValue(monthSalary)(MROT)) {
    errors.push({
      type: 'invalid',
      error: 'Введите значение больше или равное МРОТ 12 800 рублей'
    });
  }

  return errors.length ? {
    errors: errors,
    invalid: true
  } : {
    errors: errors,
    invalid: false
  };
}

function clearElement(selector) {
  var deleteElement = document.querySelector(selector);
  deleteElement && deleteElement.remove();
}

function renderTaxDeductionContainer(options) {
  clearElement('#tax-deductions-container');
  var deductionContainer = "<div id=\"tax-deductions-container\" class=\"tax-deductions popup__tax-deductions\">\n      <p>\u0418\u0442\u043E\u0433\u043E \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u043D\u0435\u0441\u0442\u0438 \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u0434\u043E\u0441\u0440\u043E\u0447\u043D\u044B\u0445:</p>\n      <ul id=\"tax-deduction-list\" class=\"tax-deductions-list\"></ul>\n    </div>";
  options.where.insertAdjacentHTML(options.position, deductionContainer);
}

function renderTaxDeductionItem(options) {
  if (options.hasOwnProperty('taxDeductions')) {
    options.taxDeductions.forEach(function (item) {
      var taxDeductionItem = "\n      <li class=\"tax-deductions-list__item\">\n          <label class=\"checkbox\">\n            <input class=\"checkbox__real\"  type=\"checkbox\">\n            <span class=\"checkbox__custom\"></span>\n            ".concat(options.formatSalary(item.amountPerYear, 'ru-RU', {
        minimumFractionDigits: 0
      }), " \u0440\u0443\u0431\u043B\u0435\u0439 \u0432 \n            <span class=\"grey-text\">").concat(item.year, "-").concat(options.declineEndings(item.year), " \u0433\u043E\u0434</span>\n          </label>\n        </li>");
      options.where.insertAdjacentHTML(options.position, taxDeductionItem);
    });
  }
}

function renderError(errorObj, options) {
  var whereElement = document.querySelector(options.whereSelector);
  var helperTextElement = document.querySelector('#helper-text');

  if (whereElement.contains(helperTextElement)) {
    helperTextElement.remove();
  }

  if (errorObj.errors.length && errorObj.invalid) {
    errorObj.errors.forEach(function (error) {
      var errorElement = "<span id=\"helper-text\" class=\"helper-text\">".concat(error.error, "</span>");
      whereElement.insertAdjacentHTML(options.position, errorElement);
    });
    options.inputField.classList.add('input--invalid');
  } else {
    options.inputField.classList.remove('input--invalid');
  }
}

function declineEndings(number) {
  var unit = number % 10;
  var dec = Math.floor(number / 10) % 10;

  if (unit === 3 && (dec < 1 || dec >= 2)) {
    return 'ий';
  } else if ((dec < 1 || dec >= 2) && unit > 0 && (unit === 2 || unit === 6 || unit === 7 || unit === 8)) {
    return 'ой';
  } else if (dec === 1 && dec <= 2 && unit !== 3) {
    return 'ый';
  }

  return 'ый';
}

function salaryUpdate(event) {
  var _event$code;

  var val = event.target.value.trim().replaceAll(/\D/g, '');
  var length = val.length;
  var formatted = formatSalary(val, 'ru-RU', {
    style: 'currency',
    minimumFractionDigits: 0,
    currency: 'RUB'
  });

  if ((event === null || event === void 0 ? void 0 : (_event$code = event.code) === null || _event$code === void 0 ? void 0 : _event$code.toLowerCase()) === 'backspace') {
    val.substring(0, length - 1);
    event.target.value = val;
  } else {
    event.target.value = formatted;
  }
}

function formatSalary(value, locale, formatOptions) {
  return new Intl.NumberFormat(locale, formatOptions).format(+value);
}

function removeClass(element, cssClass) {
  element.classList.remove(cssClass);
}

function addClass(element, cssClass) {
  element.classList.add(cssClass);
}

function openPopup() {
  addClass(popupOverlay, 'active');
  addClass(popup, 'active');
}

function closePopup(event) {
  var _event$code2;

  var target = event.target;
  var ANIMATION_SPEED = 300;

  if (target.dataset.action === 'close') {
    removeClass(popupOverlay, 'active');
    removeClass(popup, 'active');
    closing = true;
  }

  if (target.classList.contains('popup-overlay')) {
    removeClass(popupOverlay, 'active');
    removeClass(popup, 'active');
    closing = true;
  }

  if ((event === null || event === void 0 ? void 0 : (_event$code2 = event.code) === null || _event$code2 === void 0 ? void 0 : _event$code2.toLowerCase()) === 'escape' && popup.classList.contains('active') && popupOverlay.classList.contains('active')) {
    removeClass(popupOverlay, 'active');
    removeClass(popup, 'active');
    closing = true;
  }

  if (closing) {
    salaryInput.value = '';
    clearElement('#tax-deductions-container');
    window.matchMedia("(max-width: 340px)").matches && (popupInfo.style.marginBottom = '12.7rem');
  }

  setTimeout(function () {
    closing = false;
  }, ANIMATION_SPEED);
}
},{}],"../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63724" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.js"], null)
//# sourceMappingURL=/main.fb6bbcaf.js.map