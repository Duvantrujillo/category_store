import axios from "axios";

const API = import.meta.env.VITE_DEPARTMENTS_API_URL;

// Obtener departamentos
export const getDepartments = async () => {
  try {
    const res = await axios.get(
      `${API}/Department`
    );

    return Array.isArray(res.data)
      ? res.data
      : [];
  } catch (error) {
    console.error(
      "Error departamentos:",
      error
    );

    return [];
  }
};

// Obtener municipios
export const getMunicipalities = async (
  departmentId
) => {
  if (!departmentId) {
    throw new Error(
      "Se necesita un ID"
    );
  }

  try {
    const res = await axios.get(
      `${API}/Department/${departmentId}/cities`
    );



    return Array.isArray(res.data)
      ? res.data
      : [];
  } catch (error) {
    console.error(
      "Error municipios:",
      error
    );

    return [];
  }
};