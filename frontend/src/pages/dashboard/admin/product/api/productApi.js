import axios from "axios"
const API = import.meta.env.VITE_API_URL


export const allProduct = async ()=>{
    const res = await axios.get(`${API}/product/all`)
    return res.data
}
export const createProduct = async (form)=>{
    const res = await axios.post(`${API}/product/create`,form)
    return res.data
}
export const updateProduct = async (id,form)=>{
    const res = await axios.put(`${API}/product/update/${id}`,form)
    return res.data
}
export const deleteProduct = async (id)=>{
    const res = await axios.delete(`${API}/product/delete/${id}`)
    return res.data
}

export const searchProduct = async (q) => {
    const res = await axios.get(`${API}/product/search`, {
        params: { q }
    })
    return res.data
}