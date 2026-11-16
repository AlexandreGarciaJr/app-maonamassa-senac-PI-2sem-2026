const SESSION_KEY = 'mnm:session'

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Sessão do usuário logado: { token, user }. */
export const sessionStore = {
  get: () => read(SESSION_KEY),
  set: (session) => write(SESSION_KEY, session),
  clear: () => localStorage.removeItem(SESSION_KEY),
  getToken: () => read(SESSION_KEY)?.token ?? null,
}

export const jsonStorage = { read, write }
