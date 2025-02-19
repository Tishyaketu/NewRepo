import axios from "axios";

const API_URL = "http://localhost:5000";
const api = axios.create({ baseURL: API_URL });

export default api; // ✅ Add export to make it a module
