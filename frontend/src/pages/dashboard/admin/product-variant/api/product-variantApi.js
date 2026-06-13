import axios from "axios";
const API = import.meta.env.VITE_API_URL


export const allProductVariant = async () => {

    const res = await axios.get(`${API}/product-variant/all`)
    return res.data
}
export const createProductVariant = async (form) => {

    const res = await axios.post(`${API}/product-variant/create`, form)
    return res.data
}
export const updateProductVariant = async (id, form) => {

    const res = await axios.put(`${API}/product-variant/update/${id}`, form)
    return res.data
}
export const deleteProductVariant = async (id) => {

    const res = await axios.delete(`${API}/product-variant/delete/${id}`)
    return res.data
}

export const searchSkuBarcode = async (q) => {
    const res = await axios.get(`${API}/product-variant/search`, {
        params: { q }
    })
    return res.data
}