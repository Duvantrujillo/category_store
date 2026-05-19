import { useState } from "react";
import toast from "react-hot-toast";
import { registerUser } from "../api/authApi";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);

  const register = async (form) => {
    try {
      setLoading(true);

      const data = await registerUser(form);

      console.log(data);
      toast.success("Usuario creado 👍");

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
  };
};