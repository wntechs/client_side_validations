import { arrayHasValue, isValuePresent } from '../../utils';

const isInList = (value, otherValues) => otherValues.map(String).includes(value);
const isInRange = (value, range) => value >= range[0] && value <= range[1];

const isIncluded = (value, options, allowBlank) => 
  (options.allow_blank && !isValuePresent(value)) === allowBlank ||
  (options.in && isInList(value, options.in)) ||
  (options.range && isInRange(value, options.range));

export const exclusionLocalValidator = (element, options) => 
  isIncluded(element.value, options, false) || (!options.allow_blank && !isValuePresent(element.value)) 
    ? options.message 
    : undefined;

export const inclusionLocalValidator = (element, options) => 
  !isIncluded(element.value, options, true) ? options.message : undefined;

export default {
  exclusionLocalValidator,
  inclusionLocalValidator
};