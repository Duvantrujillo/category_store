import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../api/authApi";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async ({ email, password }) => {
    // 🔐 Validación básica
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      if (!data?.token || !data?.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      // 🔐 Guardado seguro de sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Bienvenido 👋");

      // 🚀 Routing por rol (escalable)
      const routesByRole = {
        admin:       "/dashboard/admin",
        super_admin: "/dashboard/admin",
        customer:    "/dashboard/customer",
      };

      navigate(routesByRole[data.user.role] || "/");

    } catch (error) {
      // 🔥 manejo controlado de errores
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error de conexión con el servidor";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    toast.success("Sesión cerrada");

    navigate("/login");
  };

  return {
    login,
    logout,
    loading,
  };
};