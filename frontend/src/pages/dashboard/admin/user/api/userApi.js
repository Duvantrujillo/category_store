import apiClient from "@/lib/apiClient";

export const getAllUsers = async () => {
  const res = await apiClient.get('/user/all');
  return res.data;
};

export const getRoles = async () => {
  const res = await apiClient.get('/user/roles');
  return res.data.roles;
};

export const adminCreateUser = async (data) => {
  const res = await apiClient.post('/user/admin-create', data);
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await apiClient.patch(`/user/${id}/status`, { status });
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await apiClient.patch(`/user/${id}`, data);
  return res.data;
};

export const resetUserPassword = async (id, data) => {
  const res = await apiClient.patch(`/user/${id}/password`, data);
  return res.data;
};
