import axios from "axios";
const API = import.meta.env.VITE_API_URL;



export const getFormResponses  = async () => {
    const res = await axios.get(`${API}/form/all`);
    return res.data.data;
};


// Enviar un nuevo envío
export const postFormResponses = async (form) => {
  const res = await axios.post(`${API}/form/create`, form); // <-- enviar form
  return res.data;
};

//actualizar un registro existente
export const updateFormResponse = async (id, form) => {
  const res = await axios.put(`${API}/form/update/${id}`, form);
  return res.data;
}


export const deleteFormResponse = async (id) => {
  const res = await axios.delete(`${API}/form/delete/${id}`);
  return res.data;
}