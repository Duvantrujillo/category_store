import { useEffect, useState } from "react";

import {
  getDepartments,
  getMunicipalities,
} from "../api/departamentApi";

export default function useDepartments() {
  const [departments, setDepartments] = useState([]);

  const [municipalities, setMunicipalities] = useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [loading, setLoading] = useState(false);

  // Cargar departamentos
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoading(true);

        const data = await getDepartments();

        setDepartments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDepartments();
  }, []);

  // Cargar municipios
  useEffect(() => {
    const loadMunicipalities = async () => {
      if (!selectedDepartment) {
        setMunicipalities([]);
        return;
      }

      try {
        setLoading(true);

        const data = await getMunicipalities(
          selectedDepartment
        );

        setMunicipalities(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMunicipalities();
  }, [selectedDepartment]);

  return {
    departments,
    municipalities,
    selectedDepartment,
    setSelectedDepartment,
    loading,
  };
}