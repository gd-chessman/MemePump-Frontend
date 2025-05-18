import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const axiosClient = axios.create({
  baseURL: `${apiUrl}/api/v1`,
});

axiosClient.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // console.error("Lỗi 401: Unauthorized");
      // localStorage.removeItem("auth_token");
      // window.location.href = "/login";
    } else if (error.code === "ERR_NETWORK") {
      console.log("Server is not responding. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
