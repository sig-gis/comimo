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

export function jsonRequest(url, jsonBody = {}, method = "POST") {
  return fetch(url,
               {
                 method,
                 headers: {
                   "Cache-Control": "no-cache",
                   "Pragma": "no-cache",
                   "Accept": "application/json",
                   "Content-Type": "application/json"
                 },
                 ...method === "POST" && {body: JSON.stringify(jsonBody)}
               })
    .then(response => (response.ok ? response.json() : Promise.reject(response)));
}

export function titleCase(str) {
  return str
    .split(" ")
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
