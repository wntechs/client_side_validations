import { isValuePresent } from '../../utils';

const isMatching = (value, regExpOptions) => new RegExp(regExpOptions.source, regExpOptions.options).test(value);
const hasValidFormat = (value, withOptions, withoutOptions) => 
  (withOptions && isMatching(value, withOptions)) || (withoutOptions && !isMatching(value, withoutOptions));

export const formatLocalValidator = (element, options) => {
  if (options.allow_blank && !isValuePresent(element.value)) return;
  return !hasValidFormat(element.value, options.with, options.without) ? options.message : undefined;
};

export default { formatLocalValidator };
