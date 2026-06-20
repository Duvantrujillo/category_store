import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllUsers, getRoles, adminCreateUser, updateUserStatus, updateUser, resetUserPassword } from "../api/userApi";

export const useAllUsers = ({ skip = false } = {}) => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchUsers = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
};

export const useRoles = () => {
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return { roles, loading };
};

export const useCreateUser = () => {
  const EMPTY = { name: "", email: "", password: "", confirmPassword: "", roleId: "", status: "active" };
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateFront = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "El nombre debe tener al menos 2 caracteres";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Correo electrónico inválido";
    if (!form.password || form.password.length < 8)
      e.password = "La contraseña debe tener al menos 8 caracteres";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";
    if (!form.roleId)
      e.roleId = "Selecciona un rol";
    return e;
  };

  const submitCreate = async (onSuccess) => {
    const frontErrors = validateFront();
    if (Object.keys(frontErrors).length > 0) {
      setErrors(frontErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await adminCreateUser(form);
      toast.success(res.message || "Usuario creado exitosamente");
      setForm(EMPTY);
      setErrors({});
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      toast.error(msg);
      // Si el backend dice qué campo falló, lo marcamos
      if (msg.toLowerCase().includes("correo")) setErrors({ email: msg });
      else if (msg.toLowerCase().includes("contraseña")) setErrors({ password: msg });
      else if (msg.toLowerCase().includes("rol")) setErrors({ roleId: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setForm(EMPTY); setErrors({}); };

  return { form, errors, loading, handleChange, submitCreate, resetForm };
};

export const useUpdateUserStatus = () => {
  const [loading, setLoading] = useState(false);

  const changeStatus = async (id, status, onSuccess) => {
    try {
      setLoading(true);
      const res = await updateUserStatus(id, status);
      toast.success(res.message || "Estado actualizado");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar estado");
    } finally {
      setLoading(false);
    }
  };

  return { changeStatus, loading };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const submitUpdate = async (id, data, onSuccess) => {
    const e = {};
    if (data.name !== undefined && data.name.trim().length < 2)
      e.name = "El nombre debe tener al menos 2 caracteres";
    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Correo electrónico inválido";
    if (data.roleId !== undefined && !data.roleId)
      e.roleId = "Selecciona un rol";

    if (Object.keys(e).length > 0) { setErrors(e); return; }

    try {
      setLoading(true);
      setErrors({});
      const res = await updateUser(id, data);
      toast.success(res.message || "Usuario actualizado");
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      toast.error(msg);
      if (msg.toLowerCase().includes("correo")) setErrors({ email: msg });
      else if (msg.toLowerCase().includes("nombre")) setErrors({ name: msg });
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => setErrors({});

  return { submitUpdate, loading, errors, clearErrors };
};

export const useResetPassword = () => {
  const EMPTY = { newPassword: "", confirmPassword: "" };
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submitReset = async (id, onSuccess) => {
    const e = {};
    if (!form.newPassword || form.newPassword.length < 8)
      e.newPassword = "La contraseña debe tener al menos 8 caracteres";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(e).length > 0) { setErrors(e); return; }

    try {
      setLoading(true);
      const res = await resetUserPassword(id, form);
      toast.success(res.message || "Contraseña restablecida");
      setForm(EMPTY);
      setErrors({});
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      toast.error(msg);
      if (msg.toLowerCase().includes("contraseña")) setErrors({ newPassword: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setForm(EMPTY); setErrors({}); };

  return { form, errors, loading, handleChange, submitReset, resetForm };
};
