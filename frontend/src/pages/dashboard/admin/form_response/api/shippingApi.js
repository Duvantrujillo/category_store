import axios from "axios";
const API = import.meta.env.VITE_API_URL;



export const getFormResponses  = async () => {
    const res = await axios.get(`${API}/form/form-responses`);
    return res.data;
};


// Enviar un nuevo envío
export const postFormResponses = async (form) => {
  const res = await axios.post(`${API}/form/register`, form); // <-- enviar form
  return res.data;
};