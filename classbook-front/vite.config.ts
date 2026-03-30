import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true, // 이 옵션이 외부 접속을 허용합니다
    port: 9999,
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 모든 요청을 가로챔
      '/api': {
        target: 'http://127.0.0.1:10000', // 요청을 전달할 실제 백엔드 주소
        changeOrigin: true,               // 호스트 헤더를 target URL로 변경 (CORS 회피용)
      }
    }
  },
})
