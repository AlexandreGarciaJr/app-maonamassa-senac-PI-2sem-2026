/**
 * Variáveis de ambiente centralizadas.
 * Nunca leia import.meta.env direto nos componentes: use este módulo.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  // Por padrão o app roda com dados simulados até o backend existir.
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
}
