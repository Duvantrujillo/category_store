import axios from "axios";
const API = import.meta.env.VITE_API_URL;



export const createCategory = async (form) => {
    const res = await axios.post(`${API}/category/create`, form)
    return res.data
}
export const allCategory = async () => {
    const res = await axios.get(`${API}/category/all`)
    return res.data
}
export const activeCategory = async () => {
    const res = await axios.get(`${API}/category/active`)
    return res.data
}

export const updateCategory = async (id, form) => {
    const res = await axios.put(`${API}/category/update/${id}`, form)
    return res.data
}

export const deleteCategory = async (id) => {
    const res = await axios.delete(`${API}/category/delete/${id}`)
    return res.data
}