import { isValuePresent } from '../../utils';

export const absenceLocalValidator = (element, options) => {
  return isValuePresent(element.value) ? options.message : undefined;
};

export const presenceLocalValidator = (element, options) => {
  return !isValuePresent(element.value) ? options.message : undefined;
};

export default {
  absenceLocalValidator,
  presenceLocalValidator,
};
