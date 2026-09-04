import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY build zamanında (Vite env
// resolution ile) bundle'a gömülüyor. Bu ikisi eksikken alınan bir
// production build, canlıda supabase.js'teki createClient(undefined,
// undefined) satırında "supabaseUrl is required" fırlatır — bu, modül
// yüklenirken (React mount olmadan) gerçekleşiyor, yani site bembeyaz
// açılır. Daha önce bu hatayla canlı çökmüştü (bkz. git geçmişi) çünkü
// deploy komutu bu değerler olmadan sessizce "başarılı" tamamlanmıştı.
// Bu yüzden production build'i (npm run build / deploy'un predeploy
// adımı) bu değerler yoksa en baştan durduruyoruz.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (mode === 'production' && (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY)) {
    throw new Error(
      '\n\n🚨 BUILD DURDURULDU: VITE_SUPABASE_URL ve/veya VITE_SUPABASE_ANON_KEY tanımlı değil.\n' +
      'Bu değerler olmadan alınan bir build canlıda "supabaseUrl is required" hatasıyla\n' +
      'BEMBEYAZ EKRAN olarak çöker. Build/deploy komutunu bu şekilde çalıştır:\n\n' +
      '  VITE_SUPABASE_URL=<url> VITE_SUPABASE_ANON_KEY=<key> npm run build\n' +
      '  VITE_SUPABASE_URL=<url> VITE_SUPABASE_ANON_KEY=<key> npm run deploy\n\n'
    )
  }

  return {
    plugins: [react()],
    base: '/',
  }
})
