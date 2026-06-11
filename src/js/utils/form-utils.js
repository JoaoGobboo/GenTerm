(function () {
  const REQUIRED_MESSAGE = "Preencha este campo.";
  const INVALID_CPF_MESSAGE = "Informe um CPF válido no formato 000.000.000-00.";
  const INVALID_DATE_MESSAGE = "Informe uma data válida.";
  const FIELD_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';

  function setupForm(config) {
    const form = config && config.form;
    const onSubmit = config && config.onSubmit;

    if (!form || typeof onSubmit !== "function") {
      return;
    }

    form.addEventListener("input", handleFormInput);
    form.addEventListener("focusout", handleFieldBlur);
    form.addEventListener("submit", function onFormSubmit(event) {
      submitForm(event, {
        form: form,
        onSubmit: onSubmit,
        busyText: (config && config.busyText) || "Gerando...",
        onError: config && config.onError
      });
    });
  }

  async function submitForm(event, config) {
    event.preventDefault();

    const form = config.form;
    const submitButton = form.querySelector('button[type="submit"]');

    clearFormErrors(form);

    if (!validateForm(form)) {
      focusFirstInvalidField(form);
      return;
    }

    setBusyState(submitButton, true, config.busyText);
    await waitForNextFrame();

    try {
      await config.onSubmit(getFormData(form), form);
    } catch (error) {
      console.error(error);

      if (typeof config.onError === "function") {
        config.onError(error);
      } else {
        window.alert("Não foi possível gerar o PDF. Verifique os dados e tente novamente.");
      }
    } finally {
      setBusyState(submitButton, false, config.busyText);
    }
  }

  function handleFormInput(event) {
    const field = getManagedField(event.target);

    if (!field) {
      return;
    }

    applyFieldMask(field);
    clearFieldError(field.form, field);
  }

  function handleFieldBlur(event) {
    const field = getManagedField(event.target);

    if (!field) {
      return;
    }

    validateField(field.form, field);
  }

  function validateForm(form) {
    let isValid = true;

    getFormFields(form).forEach(function eachField(field) {
      if (!validateField(form, field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function validateField(form, field) {
    const value = sanitizeInputValue(field.value);
    let message = "";

    if (field.required && !value) {
      message = REQUIRED_MESSAGE;
    } else if (field.dataset.mask === "cpf" && value && !isValidCpf(value)) {
      message = INVALID_CPF_MESSAGE;
    } else if (field.type === "date" && value && !isValidDateInput(value)) {
      message = INVALID_DATE_MESSAGE;
    }

    if (message) {
      showFieldError(form, field, message);
      return false;
    }

    clearFieldError(form, field);
    return true;
  }

  function showFieldError(form, field, message) {
    const wrapper = field.closest(".form-field");
    const errorElement = form.querySelector('[data-error-for="' + field.id + '"]');

    if (wrapper) {
      wrapper.classList.add("is-invalid");
    }

    field.setAttribute("aria-invalid", "true");

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearFieldError(form, field) {
    const wrapper = field.closest(".form-field");
    const errorElement = form.querySelector('[data-error-for="' + field.id + '"]');

    if (wrapper) {
      wrapper.classList.remove("is-invalid");
    }

    field.setAttribute("aria-invalid", "false");

    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function clearFormErrors(form) {
    getFormFields(form).forEach(function eachField(field) {
      clearFieldError(form, field);
    });
  }

  function focusFirstInvalidField(form) {
    const invalidField = form.querySelector(".form-field.is-invalid " + FIELD_SELECTOR);

    if (invalidField) {
      invalidField.focus();
    }
  }

  function getFormData(form) {
    const formData = new FormData(form);
    const data = {};

    formData.forEach(function assignValue(value, key) {
      data[key] = sanitizeInputValue(value);
    });

    return data;
  }

  function getFormFields(form) {
    return Array.from(form.querySelectorAll(FIELD_SELECTOR));
  }

  function getManagedField(target) {
    if (!(target instanceof HTMLElement)) {
      return null;
    }

    return target.matches(FIELD_SELECTOR) ? target : null;
  }

  function setBusyState(button, isBusy, busyText) {
    if (!button) {
      return;
    }

    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
    }

    button.disabled = isBusy;
    button.textContent = isBusy ? busyText : button.dataset.defaultLabel;
  }

  // Cede o controle ao browser para renderizar o estado de carregamento antes do processamento síncrono do PDF.
  function waitForNextFrame() {
    return new Promise(function resolveOnFrame(resolve) {
      window.requestAnimationFrame(resolve);
    });
  }

  function setDateInputToToday(input) {
    if (!input || input.value) {
      return;
    }

    input.value = getTodayIso();
  }

  function getTodayIso() {
    const now = new Date();
    // Subtrai o offset do fuso para obter a data local — new Date() em UTC pode retornar o dia anterior.
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function applyFieldMask(field) {
    if (field.dataset.mask === "cpf") {
      field.value = formatCpf(field.value);
    }
  }

  function sanitizeInputValue(value) {
    return String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCpf(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return digits.replace(/(\d{3})(\d+)/, "$1.$2");
    }

    if (digits.length <= 9) {
      return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    }

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
  }

  function padCpf(value) {
    const digits = onlyDigits(value);

    if (digits.length === 0 || digits.length > 11) {
      return digits;
    }

    return digits.padStart(11, "0");
  }

  function isValidCpf(value) {
    const digits = padCpf(value);

    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
      return false;
    }

    const base = digits.slice(0, 9);
    const verifierOne = calculateCpfVerifier(base, 10);
    const verifierTwo = calculateCpfVerifier(base + verifierOne, 11);

    return digits === base + verifierOne + verifierTwo;
  }

  function calculateCpfVerifier(value, factor) {
    const total = value.split("").reduce(function sum(accumulator, digit, index) {
      return accumulator + Number(digit) * (factor - index);
    }, 0);
    const remainder = (total * 10) % 11;
    // Resto 10 mapeia para '0' pelo algoritmo de CPF; resto 11 é impossível nesta fórmula.
    return remainder === 10 ? "0" : String(remainder);
  }

  function isValidDateInput(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  window.TermosFormUtils = {
    formatCpf: formatCpf,
    getTodayIso: getTodayIso,
    isValidCpf: isValidCpf,
    isValidDateInput: isValidDateInput,
    padCpf: padCpf,
    sanitizeInputValue: sanitizeInputValue,
    setDateInputToToday: setDateInputToToday,
    setupForm: setupForm
  };
})();
