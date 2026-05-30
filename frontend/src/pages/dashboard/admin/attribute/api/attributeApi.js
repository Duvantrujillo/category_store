import axios from "axios"

const API = import.meta.env.VITE_API_URL

export const allAttribute = async () => {
    const res = await axios.get(`${API}/attribute/all`)
    return res.data
}

export const updateAttribute = async (id, form) => {
    const res = await axios.put(
        `${API}/attribute/update/${id}`,
        form
    )

    return res.data
}

export const createAttribute = async (form) => {
    const res = await axios.post(
        `${API}/attribute/create`,
        form
    )

    return res.data
}

export const deleteAttribute = async (id) => {
    const res = await axios.delete(
        `${API}/attribute/delete/${id}`
    )

    return res.data
}