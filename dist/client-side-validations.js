/*!
 * Client Side Validations JS - v0.5.0 (https://github.com/DavyJonesLocker/client_side_validations)
 * Copyright (c) 2025 Geremia Taglialatela, Brian Cardarella
 * Licensed under MIT (https://opensource.org/licenses/mit-license.php)
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ClientSideValidations = factory());
})(this, (function () { 'use strict';

  const arrayHasValue = (value, otherValues) => {
    for (let i = 0, l = otherValues.length; i < l; i++) {
      if (value === otherValues[i]) {
        return true;
      }
    }
    return false;
  };
  const isValuePresent$1 = value => {
    return !/^\s*$/.test(value || '');
  };

  const ClientSideValidations = {
    callbacks: {
      element: {
        after: (element, eventData) => {},
        before: (element, eventData) => {},
        fail: (element, message, addError, eventData) => addError(),
        pass: (element, removeError, eventData) => removeError()
      },
      form: {
        after: (form, eventData) => {},
        before: (form, eventData) => {},
        fail: (form, eventData) => {},
        pass: (form, eventData) => {}
      }
    },
    eventsToBind: {
      form: form => ({
        submit: event => {
          if (!ClientSideValidations.isValid(form, form.ClientSideValidations.settings.validators)) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        'ajax:beforeSend': event => {
          if (event.target === form) {
            ClientSideValidations.isValid(form, form.ClientSideValidations.settings.validators);
          }
        },
        'form:validate:after': event => ClientSideValidations.callbacks.form.after(form, event),
        'form:validate:before': event => ClientSideValidations.callbacks.form.before(form, event),
        'form:validate:fail': event => ClientSideValidations.callbacks.form.fail(form, event),
        'form:validate:pass': event => ClientSideValidations.callbacks.form.pass(form, event)
      }),
      input: form => ({
        focusout: function () {
          ClientSideValidations.isValid(this, form.ClientSideValidations.settings.validators);
        },
        change: function () {
          this.dataset.csvChanged = 'true';
        },
        'element:validate:after': function (event) {
          ClientSideValidations.callbacks.element.after(this, event);
        },
        'element:validate:before': function (event) {
          ClientSideValidations.callbacks.element.before(this, event);
        },
        'element:validate:fail': function (event, message) {
          ClientSideValidations.callbacks.element.fail(this, message, () => {
            form.ClientSideValidations.addError(this, message);
          }, event);
        },
        'element:validate:pass': function (event) {
          ClientSideValidations.callbacks.element.pass(this, () => {
            form.ClientSideValidations.removeError(this);
          }, event);
        }
      })
    },
    enablers: {
      form: form => {
        form.ClientSideValidations = {
          settings: JSON.parse(form.dataset.clientSideValidations),
          addError: (element, message) => ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].add(element, form.ClientSideValidations.settings.html_settings, message),
          removeError: element => ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].remove(element, form.ClientSideValidations.settings.html_settings)
        };
        Object.entries(ClientSideValidations.eventsToBind.form(form)).forEach(_ref => {
          let [event, handler] = _ref;
          form.addEventListener(event, handler);
        });
        form.querySelectorAll(ClientSideValidations.selectors.inputs).forEach(input => {
          ClientSideValidations.enablers.input(input);
        });
      },
      input: input => {
        const form = input.form;
        Object.entries(ClientSideValidations.eventsToBind.input(form)).forEach(_ref2 => {
          let [event, handler] = _ref2;
          input.addEventListener(event, handler);
        });
      }
    },
    disable: target => {
      target.removeEventListener();
      delete target.dataset.csvValid;
      delete target.dataset.csvChanged;
    },
    reset: form => {
      ClientSideValidations.disable(form);
      Object.keys(form.ClientSideValidations.settings.validators).forEach(key => {
        ClientSideValidations.removeError(form.querySelector("[name=\"".concat(key, "\"]")));
      });
      ClientSideValidations.enablers.form(form);
    },
    isValid: (element, validators) => {
      // Implement validation logic
      return true;
    }
  };

  const absenceLocalValidator = (element, options) => {
    return isValuePresent$1(element.value) ? options.message : undefined;
  };
  const presenceLocalValidator = (element, options) => {
    return !isValuePresent$1(element.value) ? options.message : undefined;
  };

  const DEFAULT_ACCEPT_OPTION = ['1', true];
  const isTextAccepted = function (value) {
    let acceptOption = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_ACCEPT_OPTION;
    return Array.isArray(acceptOption) ? arrayHasValue(value, acceptOption) : value === acceptOption;
  };
  const acceptanceLocalValidator = (element, options) => {
    const valid = element.type === 'checkbox' ? element.checked : element.type === 'text' ? isTextAccepted(element.value, options.accept) : true;
    return valid ? undefined : options.message;
  };

  const isMatching = (value, regExpOptions) => new RegExp(regExpOptions.source, regExpOptions.options).test(value);
  const hasValidFormat = (value, withOptions, withoutOptions) => withOptions && isMatching(value, withOptions) || withoutOptions && !isMatching(value, withoutOptions);
  const formatLocalValidator = (element, options) => {
    if (options.allow_blank && !isValuePresent$1(element.value)) return;
    return !hasValidFormat(element.value, options.with, options.without) ? options.message : undefined;
  };

  const formatValue = element => {
    const numberFormat = element.form.ClientSideValidations.settings.number_format;
    return (element.value || '').trim().replace(new RegExp("\\".concat(numberFormat.separator), 'g'), '.');
  };
  const getOtherValue = (validationOption, form) => {
    if (!isNaN(parseFloat(validationOption))) return validationOption;
    const validationElement = form.querySelector("[name*=\"".concat(validationOption, "\"]"));
    return validationElement ? formatValue(validationElement) : undefined;
  };
  const runFunctionValidations = (formattedValue, form, options) => {
    for (const validation in VALIDATIONS) {
      const validationOption = options[validation];
      if (validationOption == null) continue;
      if (!VALIDATIONS[validation](formattedValue, getOtherValue(validationOption, form))) {
        return options.messages[validation];
      }
    }
  };
  const runValidations$1 = (formattedValue, form, options) => {
    if (options.only_integer && !ClientSideValidations.patterns.numericality.only_integer.test(formattedValue)) {
      return options.messages.only_integer;
    }
    if (!ClientSideValidations.patterns.numericality.default.test(formattedValue)) {
      return options.messages.numericality;
    }
    return runFunctionValidations(formattedValue, form, options);
  };
  const numericalityLocalValidator = (element, options) => {
    if (options.allow_blank && !isValuePresent(element.value)) return;
    return runValidations$1(formatValue(element), element.form, options);
  };

  const VALIDATIONS$1 = {
    is: (a, b) => a === parseInt(b, 10),
    minimum: (a, b) => a >= parseInt(b, 10),
    maximum: (a, b) => a <= parseInt(b, 10)
  };
  const runValidations = (valueLength, options) => {
    for (const validation in VALIDATIONS$1) {
      if (options[validation] && !VALIDATIONS$1[validation](valueLength, options[validation])) {
        return options.messages[validation];
      }
    }
  };
  const lengthLocalValidator = (element, options) => {
    if (options.allow_blank && !isValuePresent(element.value)) return;
    return runValidations(element.value.length, options);
  };

  const isInList = (value, otherValues) => otherValues.map(String).includes(value);
  const isInRange = (value, range) => value >= range[0] && value <= range[1];
  const isIncluded = (value, options, allowBlank) => (options.allow_blank && !isValuePresent$1(value)) === allowBlank || options.in && isInList(value, options.in) || options.range && isInRange(value, options.range);
  const exclusionLocalValidator = (element, options) => isIncluded(element.value, options, false) || !options.allow_blank && !isValuePresent$1(element.value) ? options.message : undefined;
  const inclusionLocalValidator = (element, options) => !isIncluded(element.value, options, true) ? options.message : undefined;

  const confirmationLocalValidator = (element, options) => {
    const confirmationElement = document.getElementById("".concat(element.id, "_confirmation"));
    if (!confirmationElement) return;
    let {
      value
    } = element;
    let confirmationValue = confirmationElement.value;
    if (!options.case_sensitive) {
      value = value.toLowerCase();
      confirmationValue = confirmationValue.toLowerCase();
    }
    return value !== confirmationValue ? options.message : undefined;
  };

  const isLocallyUnique = (element, value, otherValue, caseSensitive) => {
    if (!caseSensitive) {
      value = value.toLowerCase();
      otherValue = otherValue.toLowerCase();
    }
    if (otherValue === value) {
      element.dataset.notLocallyUnique = true;
      return false;
    }
    if (element.dataset.notLocallyUnique) {
      delete element.dataset.notLocallyUnique;
      element.dataset.changed = true;
    }
    return true;
  };
  const uniquenessLocalValidator = (element, options) => {
    const matches = element.name.match(/^(.+_attributes\])\[\d+\](.+)$/);
    if (!matches) return;
    const form = element.form;
    const query = "[name^=\"".concat(matches[1], "\"][name$=\"").concat(matches[2], "\"]:not([name=\"").concat(element.name, "\"])");
    const otherElements = form.querySelectorAll(query);
    for (const otherElement of otherElements) {
      if (!isLocallyUnique(otherElement, element.value, otherElement.value, options.case_sensitive)) {
        return options.message;
      }
    }
  };

  ClientSideValidations.validators.local = {
    absence: absenceLocalValidator,
    presence: presenceLocalValidator,
    acceptance: acceptanceLocalValidator,
    format: formatLocalValidator,
    numericality: numericalityLocalValidator,
    length: lengthLocalValidator,
    inclusion: inclusionLocalValidator,
    exclusion: exclusionLocalValidator,
    confirmation: confirmationLocalValidator,
    uniqueness: uniquenessLocalValidator
  };
  Element.prototype.disableClientSideValidations = function () {
    ClientSideValidations.disable(this);
    return this;
  };
  Element.prototype.enableClientSideValidations = function () {
    if (this.matches(ClientSideValidations.selectors.forms)) {
      ClientSideValidations.enablers.form(this);
    } else if (this.matches(ClientSideValidations.selectors.inputs)) {
      ClientSideValidations.enablers.input(this);
    }
    return this;
  };
  Element.prototype.resetClientSideValidations = function () {
    if (this.matches(ClientSideValidations.selectors.forms)) {
      ClientSideValidations.reset(this);
    }
    return this;
  };
  Element.prototype.validate = function () {
    if (this.matches(ClientSideValidations.selectors.forms)) {
      this.enableClientSideValidations();
    }
    return this;
  };
  Element.prototype.isValid = function (validators) {
    if (this.matches('form')) {
      return validateForm(this, validators);
    } else {
      return validateElement(this, validatorsFor(this.name, validators));
    }
  };
  const validateForm = (form, validators) => {
    let valid = true;
    form.dispatchEvent(new Event('form:validate:before.ClientSideValidations'));
    form.querySelectorAll(ClientSideValidations.selectors.validate_inputs).forEach(input => {
      if (!input.isValid(validators)) {
        valid = false;
      }
    });
    form.dispatchEvent(new Event(valid ? 'form:validate:pass.ClientSideValidations' : 'form:validate:fail.ClientSideValidations'));
    form.dispatchEvent(new Event('form:validate:after.ClientSideValidations'));
    return valid;
  };
  const validateElement = (element, validators) => {
    element.dispatchEvent(new Event('element:validate:before.ClientSideValidations'));
    if (!isMarkedForDestroy(element)) {
      executeAllValidators(element, validators);
    }
    return afterValidate(element);
  };
  const afterValidate = element => {
    element.dispatchEvent(new Event('element:validate:after.ClientSideValidations'));
    return element.dataset.csvValid !== 'false';
  };
  const executeAllValidators = (element, validators) => {
    if (element.dataset.csvChanged === 'false' || element.disabled) return;
    element.dataset.csvChanged = 'false';
    if (executeValidators(ClientSideValidations.validators.all(), element, validators)) {
      passElement(element);
    }
  };
  const executeValidators = (validatorFunctions, element, validators) => {
    for (const validator in validators) {
      if (!validatorFunctions[validator]) continue;
      if (!executeValidator(validatorFunctions, validatorFunctions[validator], validators[validator], element)) {
        return false;
      }
    }
    return true;
  };
  const executeValidator = (validatorFunctions, validatorFunction, validatorOptions, element) => {
    for (const validatorOption in validatorOptions) {
      if (!validatorOptions[validatorOption]) continue;
      const message = validatorFunction.call(validatorFunctions, element, validatorOptions[validatorOption]);
      if (message) {
        failElement(element, message);
        return false;
      }
    }
    return true;
  };
  const passElement = element => {
    element.dispatchEvent(new Event('element:validate:pass.ClientSideValidations'));
    delete element.dataset.csvValid;
  };
  const failElement = (element, message) => {
    element.dispatchEvent(new CustomEvent('element:validate:fail.ClientSideValidations', {
      detail: message
    }));
    element.dataset.csvValid = 'false';
  };
  const isMarkedForDestroy = element => {
    const destroyInputName = element.name.replace(/\[([^\]]*?)\]$/, '[_destroy]');
    const destroyInputElement = document.querySelector("input[name=\"".concat(destroyInputName, "\"]"));
    return destroyInputElement && destroyInputElement.value === '1';
  };
  if (!window.ClientSideValidations) {
    window.ClientSideValidations = ClientSideValidations;
    if (typeof define !== 'function' || !define.amd) {
      if (typeof exports !== 'object' || typeof module === 'undefined') {
        ClientSideValidations.start();
      }
    }
  }

  return ClientSideValidations;

}));
