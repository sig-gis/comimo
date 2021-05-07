export function toPrecision(val, n) {
  const factor = 10 ** n;
  return Math.round(val * factor) / factor;
}

// From Django docs.  Not functionally written.
export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
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
