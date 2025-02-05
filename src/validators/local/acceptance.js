import { arrayHasValue } from '../../utils';

const DEFAULT_ACCEPT_OPTION = ['1', true];

const isTextAccepted = (value, acceptOption = DEFAULT_ACCEPT_OPTION) =>
  Array.isArray(acceptOption) ? arrayHasValue(value, acceptOption) : value === acceptOption;

export const acceptanceLocalValidator = (element, options) => {
  const valid = element.type === 'checkbox' ? element.checked : 
                element.type === 'text' ? isTextAccepted(element.value, options.accept) : true;
  return valid ? undefined : options.message;
};

export default {
  acceptanceLocalValidator
};