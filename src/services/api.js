import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 3500,
});

export default api;