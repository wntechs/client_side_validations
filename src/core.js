import { createElementFromHTML } from './utils';

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
    form: (form) => ({
      submit: (event) => {
        if (!ClientSideValidations.isValid(form, form.ClientSideValidations.settings.validators)) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      'ajax:beforeSend': (event) => {
        if (event.target === form) {
          ClientSideValidations.isValid(form, form.ClientSideValidations.settings.validators);
        }
      },
      'form:validate:after': (event) => ClientSideValidations.callbacks.form.after(form, event),
      'form:validate:before': (event) => ClientSideValidations.callbacks.form.before(form, event),
      'form:validate:fail': (event) => ClientSideValidations.callbacks.form.fail(form, event),
      'form:validate:pass': (event) => ClientSideValidations.callbacks.form.pass(form, event)
    }),
    input: (form) => ({
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
    form: (form) => {
      form.ClientSideValidations = {
        settings: JSON.parse(form.dataset.clientSideValidations),
        addError: (element, message) => ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].add(element, form.ClientSideValidations.settings.html_settings, message),
        removeError: (element) => ClientSideValidations.formBuilders[form.ClientSideValidations.settings.html_settings.type].remove(element, form.ClientSideValidations.settings.html_settings)
      };
      
      Object.entries(ClientSideValidations.eventsToBind.form(form)).forEach(([event, handler]) => {
        form.addEventListener(event, handler);
      });
      
      form.querySelectorAll(ClientSideValidations.selectors.inputs).forEach((input) => {
        ClientSideValidations.enablers.input(input);
      });
    },
    input: (input) => {
      const form = input.form;
      
      Object.entries(ClientSideValidations.eventsToBind.input(form)).forEach(([event, handler]) => {
        input.addEventListener(event, handler);
      });
    }
  },
  disable: (target) => {
    target.removeEventListener();
    delete target.dataset.csvValid;
    delete target.dataset.csvChanged;
  },
  reset: (form) => {
    ClientSideValidations.disable(form);
    Object.keys(form.ClientSideValidations.settings.validators).forEach((key) => {
      ClientSideValidations.removeError(form.querySelector(`[name="${key}"]`));
    });
    ClientSideValidations.enablers.form(form);
  },
  isValid: (element, validators) => {
    // Implement validation logic
    return true;
  }
};

export default ClientSideValidations;
