import { useEffect, useState } from "react";

import {
  getDepartments,
  getMunicipalities,
} from "../api/departamentApi";

// 🔥 CACHE GLOBAL
let departmentsCache = null;
let municipalitiesCache = {};

export default function useCreateShippingLocations() {

  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [loading, setLoading] = useState(false);

  // ======================================================
  // 🔵 CARGAR DEPARTAMENTOS AUTOMÁTICAMENTE
  // ======================================================
  useEffect(() => {

    const loadDepartments = async () => {

      try {

        setLoading(true);

        // 🔥 USAR CACHE SI YA EXISTE
        if (departmentsCache) {

          setDepartments(departmentsCache);

          return;
        }

        const data = await getDepartments();

        // 🔥 GUARDAR CACHE
        departmentsCache = data;

        setDepartments(data);

      } catch (error) {

        console.error(
          "Error departamentos:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    loadDepartments();

  }, []);

  // ======================================================
  // 🔵 CARGAR MUNICIPIOS
  // CUANDO CAMBIA selectedDepartment
  // ======================================================
  useEffect(() => {

    const loadMunicipalities = async () => {

      // 🔥 SI NO HAY DEPARTAMENTO
      if (!selectedDepartment) {

        setMunicipalities([]);

        return;
      }

      try {

        setLoading(true);

        // 🔥 CACHE POR DEPARTAMENTO
        if (
          municipalitiesCache[selectedDepartment]
        ) {

          setMunicipalities(
            municipalitiesCache[selectedDepartment]
          );

          return;
        }

        const data = await getMunicipalities(
          selectedDepartment
        );

        // 🔥 GUARDAR CACHE
        municipalitiesCache[selectedDepartment] =
          data;

        setMunicipalities(data);

      } catch (error) {

        console.error(
          "Error municipios:",
          error
        );

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