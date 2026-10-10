import axios from "axios";

// create axios instance with base url + cookies enabled
// in dev, vite proxy forwards /api to localhost:5000
// in production, VITE_API_URL points to the deployed backend
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",     // default to /api
    withCredentials: true                                // send cookies with requests
});

export default api;