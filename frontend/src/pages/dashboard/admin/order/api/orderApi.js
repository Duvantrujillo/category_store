import axios from 'axios'
const API = import.meta.env.VITE_API_URL




export const allOrder = async () => {
    const res = await axios.get(`${API}/order/all`)
    return res.data
}