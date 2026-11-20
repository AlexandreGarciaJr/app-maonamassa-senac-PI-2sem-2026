/**
 * Variáveis de ambiente centralizadas.
 * Nunca leia import.meta.env direto nos componentes: use este módulo.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  // Sem VITE_USE_MOCKS=false, o app roda com os dados de exemplo (modo demonstração).
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
  // Backend real: Supabase (banco, login e arquivos). Ver supabase/README.md.
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
}
