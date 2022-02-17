export function toPrecision(val, n) {
  const factor = 10 ** n;
  return Math.round(val * factor) / factor;
}

export function getLanguage(acceptableLanguages) {
  const locale = navigator.language || navigator.browserLanguage || navigator.systemLanguage || "en";
  const language = locale.includes("-") ? locale.slice(0, 2) : locale;
  return acceptableLanguages.includes(language) ? language : "en";
}

export function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)
        || password.length >= 16;
}
