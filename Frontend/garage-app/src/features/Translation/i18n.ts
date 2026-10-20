import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "../../locales/en/translation.json";
import translationAR from "../../locales/ar/translation.json";

const stored = localStorage.getItem("language");
const currentLang = stored === "ar" || stored === "en" ? stored : "en";

function applyDirection(lng: string) {
  const isArabic = lng.startsWith("ar");
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.documentElement.lang = isArabic ? "ar" : "en";
}

i18n.on("languageChanged", applyDirection);

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEN },
    ar: { translation: translationAR },
  },
  lng: currentLang,
  fallbackLng: "en",
  keySeparator: false,
  interpolation: { escapeValue: false },
});

applyDirection(currentLang);

export default i18n;
