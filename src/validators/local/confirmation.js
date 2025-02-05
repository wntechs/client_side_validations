export const confirmationLocalValidator = (element, options) => {
  const confirmationElement = document.getElementById(`${element.id}_confirmation`);
  if (!confirmationElement) return;
  
  let { value } = element;
  let confirmationValue = confirmationElement.value;
  
  if (!options.case_sensitive) {
    value = value.toLowerCase();
    confirmationValue = confirmationValue.toLowerCase();
  }

  return value !== confirmationValue ? options.message : undefined;
};

export default {
  confirmationLocalValidator
};
