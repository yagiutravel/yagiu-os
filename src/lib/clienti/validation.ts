import type { ClienteForm, ClienteFormErrors } from "@/types/cliente";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateClienteForm(form: ClienteForm): ClienteFormErrors {
  const errors: ClienteFormErrors = {};

  if (!form.nome.trim()) {
    errors.nome = "Il nome è obbligatorio.";
  } else if (form.nome.trim().length < 2) {
    errors.nome = "Il nome deve contenere almeno 2 caratteri.";
  }

  if (!form.email.trim()) {
    errors.email = "L'email è obbligatoria.";
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = "Inserisci un indirizzo email valido.";
  }

  if (form.telefono.trim() && form.telefono.trim().length < 6) {
    errors.telefono = "Il telefono deve contenere almeno 6 caratteri.";
  }

  return errors;
}

export function hasFormErrors(errors: ClienteFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
