import ClientSideValidations from '../../core';

const formatValue = (element) => {
  const numberFormat = element.form.ClientSideValidations.settings.number_format;
  return (element.value || '').trim().replace(new RegExp(`\\${numberFormat.separator}`, 'g'), '.');
};

const getOtherValue = (validationOption, form) => {
  if (!isNaN(parseFloat(validationOption))) return validationOption;
  const validationElement = form.querySelector(`[name*="${validationOption}"]`);
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

const runValidations = (formattedValue, form, options) => {
  if (options.only_integer && !ClientSideValidations.patterns.numericality.only_integer.test(formattedValue)) {
    return options.messages.only_integer;
  }
  if (!ClientSideValidations.patterns.numericality.default.test(formattedValue)) {
    return options.messages.numericality;
  }
  return runFunctionValidations(formattedValue, form, options);
};

export const numericalityLocalValidator = (element, options) => {
  if (options.allow_blank && !isValuePresent(element.value)) return;
  return runValidations(formatValue(element), element.form, options);
};

export default { numericalityLocalValidator };