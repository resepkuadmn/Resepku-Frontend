import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Pastikan port Laravel benar
});

// Interceptor: Selipkan Token di setiap request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Jika token salah, hapus
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
      if (response && response.status === 401) {
        // Don't auto-redirect for failed login attempts — let the login page
        // handle credential errors directly so it can show the message.
        const requestUrl = (error.config && error.config.url) || '';

        // If the 401 came from any endpoint other than /login (e.g., a protected
        // API route when the token is invalid/expired), then remove the token
        // and redirect to login. For requests to /login, skip the redirect and
        // let the component show the error message.
        if (!requestUrl.endsWith('/login')) {
          localStorage.removeItem('ACCESS_TOKEN');
          try { window.location.href = '/login'; } catch (e) { /* noop */ }
        }
      }
    throw error;
  }
);

export default axiosClient;