import { useEffect, useState, useCallback } from "react";
import { activeCategory, allCategory, deleteCategory, updateCategory, createCategory } from "../api/categoryApi";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  isActive: true,
  sortOrder: 0,
  parentId: null,
  image: null,
  preview: null,
};

export const useCreateCategory = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => setForm({ ...EMPTY_FORM });

  const submitCreate = async () => {
    try {
      setLoading(true);
      setError(null);

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("isActive", String(form.isActive));
      fd.append("sortOrder", String(Number(form.sortOrder) || 0));
      fd.append("parentId", form.parentId != null ? String(form.parentId) : "");
      if (form.image instanceof File) fd.append("image", form.image);

      const res = await createCategory(fd);
      toast.success(res?.message || "Categoría creada correctamente");
      resetForm();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear categoría";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, error, handleChange, submitCreate, resetForm };
};


export const useUpdateCategory = () => {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    sortOrder: 0,
    parentId: null,
    image: null,
    preview: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const setInitialData = (category) => {
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId ?? null,
      image: null,
      preview: category.imageUrl || null,
    });
  };

  const submitUpdate = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("isActive", String(form.isActive));
      fd.append("sortOrder", String(Number(form.sortOrder) || 0));
      fd.append("parentId", form.parentId != null ? String(form.parentId) : "");
      if (form.image instanceof File) fd.append("image", form.image);

      const res = await updateCategory(id, fd);
      toast.success(res?.message || "Categoría actualizada correctamente");
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

  return { form, handleChange, setInitialData, submitUpdate, loading, error };
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
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
      const msg = err.response?.data?.message || "Error al eliminar categoría";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitDelete, loading, error };
};
