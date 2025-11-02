const BASE_URL = process.env.PAGES_BASE_URL || "";

export function loginRoute() {
  return BASE_URL + "/login";
}

export function homeRoute() {
  return BASE_URL + "/home";
}

export function appleRoute() {
  return BASE_URL + "/apple";
}
