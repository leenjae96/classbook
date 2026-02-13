import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true, // 이 옵션이 외부 접속을 허용합니다
    port: 9999
  },
})
