import type { TFunction } from "i18next";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function rules(t: TFunction) {
  const required = t("validation.required");
  return {
    required: { required },
    email: {
      required,
      pattern: { value: EMAIL_PATTERN, message: t("validation.email") },
    },
    phone: {
      required,
      maxLength: { value: 12, message: t("validation.phoneMax") },
    },
    password: {
      required,
      minLength: { value: 8, message: t("validation.passwordMin") },
    },
    latitude: {
      required,
      validate: (value: unknown) => {
        const n = Number(value);
        return (Number.isFinite(n) && n >= -90 && n <= 90) || t("validation.latitude");
      },
    },
    longitude: {
      required,
      validate: (value: unknown) => {
        const n = Number(value);
        return (Number.isFinite(n) && n >= -180 && n <= 180) || t("validation.longitude");
      },
    },
    positiveNumber: {
      required,
      validate: (value: unknown) => Number(value) > 0 || t("validation.positive"),
    },
    matches: (other: () => string) => ({
      required,
      validate: (value: unknown) => value === other() || t("validation.passwordMatch"),
    }),
  };
}
