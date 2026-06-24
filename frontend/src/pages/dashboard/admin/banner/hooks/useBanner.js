import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllBanners, createBanner, updateBanner, deleteBanner } from "../api/bannerApi";

/* ── GET ALL ── */
export const useAllBanners = ({ skip = false } = {}) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchBanners = useCallback(async () => {
    if (skip) return;
    try {
      setLoading(true);
      setError(null);
      const res  = await getAllBanners();
      const data = res?.data?.data ?? res?.data ?? res;
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [skip]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  return { banners, loading, error, refetch: fetchBanners };
};

/* ── CREATE ── */
export const useCreateBanner = () => {
  const [form, setForm] = useState({
    title:     "",
    link:      "",
    startDate: "",
    endDate:   "",
    isActive:  true,
    position:  0,
    image:     null,
    preview:   "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () =>
    setForm({ title: "", link: "", startDate: "", endDate: "", isActive: true, position: 0, image: null, preview: "" });

  const submitCreate = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title",     form.title);
      fd.append("link",      form.link      || "");
      fd.append("startDate", form.startDate);
      fd.append("endDate",   form.endDate);
      fd.append("isActive",  form.isActive);
      fd.append("position",  form.position);
      if (form.image) fd.append("image", form.image);

      const res = await createBanner(fd);
      toast.success(res.message || "Banner creado correctamente");
      resetForm();
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear el banner";
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { form, handleChange, submitCreate, resetForm, loading };
};

/* ── UPDATE ── */
export const useUpdateBanner = () => {
  const [form, setForm] = useState({
    title:     "",
    link:      "",
    startDate: "",
    endDate:   "",
    isActive:  true,
    position:  0,
    image:     null,
    preview:   "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setInitialData = (banner) => {
    const toDateInput = (iso) => iso ? iso.slice(0, 10) : "";
    setForm({
      title:     banner.title     || "",
      link:      banner.link      || "",
      startDate: toDateInput(banner.startDate),
      endDate:   toDateInput(banner.endDate),
      isActive:  banner.isActive  ?? true,
      position:  banner.position  ?? 0,
      image:     null,
      preview:   banner.imageUrl  || "",
    });
  };

  const submitUpdate = async (id) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title",     form.title);
      fd.append("link",      form.link      || "");
      fd.append("startDate", form.startDate);
      fd.append("endDate",   form.endDate);
      fd.append("isActive",  form.isActive);
      fd.append("position",  form.position);
      if (form.image) fd.append("image", form.image);

      const res = await updateBanner(id, fd);
      toast.success(res.message || "Banner actualizado correctamente");
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al actualizar el banner";
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { form, handleChange, setInitialData, submitUpdate, loading };
};

/* ── DELETE ── */
export const useDeleteBanner = () => {
  const [loading, setLoading] = useState(false);

  const submitDelete = async (id) => {
    try {
      setLoading(true);
      const res = await deleteBanner(id);
      toast.success(res.message || "Banner eliminado correctamente");
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al eliminar el banner";
      if (!err._handled) toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitDelete, loading };
};
