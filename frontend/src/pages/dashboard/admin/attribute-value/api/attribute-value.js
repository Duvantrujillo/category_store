import axios from "axios"
const API = import.meta.env.VITE_API_URL

export const allAtributeValue = async ()=>{
    const res = await axios.get(`${API}/attribute-values/all`)
    return res.data
} 
export const createAtributeValue = async (form)=>{
    const res = await axios.post(`${API}/attribute-values/create`,form)
    return res.data
} 
export const updateAtributeValue = async (id,form)=>{
    const res = await axios.put(`${API}/attribute-values/update/${id}`,form)
    return res.data
} 
export const deleteAtributeValue = async (id)=>{
    const res = await axios.delete(`${API}/attribute-values/delete/${id}`)
    return res.data
} 

