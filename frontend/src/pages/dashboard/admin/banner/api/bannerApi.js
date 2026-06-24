import apiClient from "@/lib/apiClient";

export const getAllBanners = async () => {
  const res = await apiClient.get("/banner/all");
  return res.data;
};

export const createBanner = async (formData) => {
  const res = await apiClient.post("/banner/create", formData);
  return res.data;
};

export const updateBanner = async (id, formData) => {
  const res = await apiClient.put(`/banner/update/${id}`, formData);
  return res.data;
};

export const deleteBanner = async (id) => {
  const res = await apiClient.delete(`/banner/delete/${id}`);
  return res.data;
};
