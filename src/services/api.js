import axios from "axios";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "EXPO_PUBLIC_API_URL no está configurada"
  );
}

console.log("API_URL cargada:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      error.message ||
      "No fue posible conectar con el servidor";

    error.message = mensaje;

    console.log("Error de API:", {
      mensaje,
      estado: error.response?.status,
      datos: error.response?.data,
      baseURL: error.config?.baseURL,
      ruta: error.config?.url,
    });

    return Promise.reject(error);
  }
);

export default api;