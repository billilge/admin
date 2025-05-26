import axios from 'axios'

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials: true, // 쿠키 사용하는 경우
})

// 요청 인터셉터: 토큰 삽입 등
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 응답 인터셉터: 에러 로깅, 리프레시 처리 등
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 401이면 로그아웃 처리 or 토큰 리프레시 등
        if (error.response?.status === 401) {
            console.warn('인증 만료됨')
        }
        return Promise.reject(error)
    }
)
