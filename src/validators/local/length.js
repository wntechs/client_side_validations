const VALIDATIONS = {
  is: (a, b) => a === parseInt(b, 10),
  minimum: (a, b) => a >= parseInt(b, 10),
  maximum: (a, b) => a <= parseInt(b, 10),
};

const runValidations = (valueLength, options) => {
  for (const validation in VALIDATIONS) {
    if (options[validation] && !VALIDATIONS[validation](valueLength, options[validation])) {
      return options.messages[validation];
    }
  }
};

export const lengthLocalValidator = (element, options) => {
  if (options.allow_blank && !isValuePresent(element.value)) return;
  return runValidations(element.value.length, options);
};

export default { lengthLocalValidator };