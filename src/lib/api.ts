import axios from "axios";

// ----------------------------------------------------------------------
// 1. Création de l'instance Axios
// ----------------------------------------------------------------------
const api = axios.create({
  // URL de base de l'API NestJS, modifiable via variable d'environnement
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------------------------
// 2. Intercepteur de requêtes
//    Ajoute automatiquement le token JWT à chaque appel protégé
// ----------------------------------------------------------------------
api.interceptors.request.use((config) => {
  // Vérification de l'existence de window pour éviter les erreurs SSR
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ----------------------------------------------------------------------
// 3. Intercepteur de réponses
//    En cas d'erreur 401 (token expiré), tente un refresh automatique
// ----------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response, // Succès : on renvoie la réponse telle quelle
  async (error) => {
    const originalRequest = error.config;

    // Si ce n'est pas une 401, ou si on a déjà essayé un refresh,
    // on rejette directement l'erreur
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // On marque cette requête pour éviter une boucle infinie de refresh
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Appel à l'endpoint de refresh (public : pas besoin d'Authorization)
      const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data;

      // Mise à jour des tokens dans le localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      // On réessaie la requête originale avec le nouveau token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // En cas d'échec du refresh, on nettoie tout et on redirige
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Redirection vers la page de connexion
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

export default api;
