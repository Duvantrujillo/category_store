import axios from 'axios'
const API = import.meta.env.VITE_API_URL


export const allshipment = async () => {
    const res = await axios.get(`${API}/shipment/all`)
    return res.data
}

export const updateShipment = async (id, data) => {
    const res = await axios.put(`${API}/shipment/${id}`, data)
    return res.data
}

export const getShipmentHistory = async (id) => {
    const res = await axios.get(`${API}/shipment/${id}/history`)
    return res.data
}