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

export const uniquenessLocalValidator = (element, options) => {
  const matches = element.name.match(/^(.+_attributes\])\[\d+\](.+)$/);
  if (!matches) return;
  
  const form = element.form;
  const query = `[name^="${matches[1]}"][name$="${matches[2]}"]:not([name="${element.name}"])`;
  const otherElements = form.querySelectorAll(query);
  
  for (const otherElement of otherElements) {
    if (!isLocallyUnique(otherElement, element.value, otherElement.value, options.case_sensitive)) {
      return options.message;
    }
  }
};

export default { uniquenessLocalValidator };
