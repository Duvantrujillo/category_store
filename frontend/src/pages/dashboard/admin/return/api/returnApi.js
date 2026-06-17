import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export const allReturnRequests = async () => {
    const res = await axios.get(`${API}/return-request/all`)
    return res.data
}

export const createReturnRequest = async (data) => {
    const res = await axios.post(`${API}/return-request/create`, data)
    return res.data
}

export const updateReturnRequest = async (id, data) => {
    const res = await axios.put(`${API}/return-request/${id}`, data)
    return res.data
}

export const createReturnItems = async (returnRequestId, items) => {
    const res = await axios.post(`${API}/return-item/create`, {
        returnRequest: returnRequestId,
        items,
    })
    return res.data
}

export const getPaymentMethods = async () => {
    const res = await axios.get(`${API}/payment/methods`)
    return res.data
}

export const createRefund = async (returnRequestId) => {
    const res = await axios.post(`${API}/refund/create`, { returnRequestId })
    return res.data
}

export const processRefund = async (refundId, method, reference) => {
    const res = await axios.post(`${API}/refund/process`, { refundId, method, reference })
    return res.data
}
