import ClientSideValidations from './core';

import { absenceLocalValidator, presenceLocalValidator } from './validators/local/absence_presence';
import { acceptanceLocalValidator } from './validators/local/acceptance';
import { formatLocalValidator } from './validators/local/format';
import { numericalityLocalValidator } from './validators/local/numericality';
import { lengthLocalValidator } from './validators/local/length';
import { exclusionLocalValidator, inclusionLocalValidator } from './validators/local/exclusion_inclusion';
import { confirmationLocalValidator } from './validators/local/confirmation';
import { uniquenessLocalValidator } from './validators/local/uniqueness';

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
  uniqueness: uniquenessLocalValidator,
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

  form.querySelectorAll(ClientSideValidations.selectors.validate_inputs).forEach((input) => {
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

const afterValidate = (element) => {
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

const passElement = (element) => {
  element.dispatchEvent(new Event('element:validate:pass.ClientSideValidations'));
  delete element.dataset.csvValid;
};

const failElement = (element, message) => {
  element.dispatchEvent(new CustomEvent('element:validate:fail.ClientSideValidations', { detail: message }));
  element.dataset.csvValid = 'false';
};

const isMarkedForDestroy = (element) => {
  const destroyInputName = element.name.replace(/\[([^\]]*?)\]$/, '[_destroy]');
  const destroyInputElement = document.querySelector(`input[name="${destroyInputName}"]`);
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

export default ClientSideValidations;
