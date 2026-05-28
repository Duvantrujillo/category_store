import { useEffect, useState, useCallback } from "react";
import { activeCategory, allCategory, deleteCategory,updateCategory,createCategory } from "../api/category.Api";
import toast from "react-hot-toast";


export const useCreateCategory = () => {

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    sortOrder: 0,
    parentId: null,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [response, setResponse] = useState(null);

  /*
    🔥 MANEJAR INPUTS
  */
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
    🔥 RESET FORM
  */
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isActive: true,
      sortOrder: 0,
      parentId: null,
    });
  };

  /*
    🔥 SUBMIT CREATE
  */
  const submitCreate = async () => {

    try {

      setLoading(true);

      setError(null);

      const payload = {
        ...form,

        /*
          🔥 EVITAR "" EN parentId
        */
        parentId:
          form.parentId === "" || form.parentId == null
            ? null
            : Number(form.parentId),

        /*
          🔥 ASEGURAR NUMBER
        */
        sortOrder: Number(form.sortOrder),
      };

      const res = await createCategory(payload);

      setResponse(res);

      toast.success(
        res?.message || "Categoría creada correctamente"
      );

      resetForm();

      return res;

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Error al crear categoría";

      setError(msg);

      toast.error(msg);

      throw err;

    } finally {

      setLoading(false);

    }
  };

  return {
    form,
    loading,
    error,
    response,
    handleChange,
    submitCreate,
    resetForm,
  };
};


export const useUpdateCategory = () => {

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: 0,
    parentId: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setInitialData = (category) => {
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId ?? null
    });
  };

  const submitUpdate = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await updateCategory(id, form);

      setResponse(res);
      toast.success(res.message || "Categoría actualizada correctamente");

      return res;

    } catch (err) {
      const msg = err.response?.data?.message || "Error de conexión";
      setError(msg);

      toast.error(msg);
      throw err;

    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    handleChange,
    setInitialData,
    submitUpdate,
    loading,
    error,
    response
  };
};

export const useAllCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await allCategory();

      const data = res?.data?.data || res?.data || res;

      setCategories(Array.isArray(data) ? data : []);

      setError(null);

    } catch (err) {
      setError(err);
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export const useActiveCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await activeCategory();

      const data = res?.data?.data || res?.data || res;

      setCategories(Array.isArray(data) ? data : []);

      setError(null);

    } catch (err) {
      setError(err);
      toast.error("Error loading categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export const useDeleteCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitDelete = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await deleteCategory(id);

      toast.success(res.message || "Categoría eliminada correctamente");

      return res;
    } catch (err) {
      const msg =
        err.response?.data?.message || "Error al eliminar categoría";

      setError(msg);
      toast.error(msg);

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitDelete,
    loading,
    error,
  };
};