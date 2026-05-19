import { useCreateShipping } from "../hooks/useShipping";
import useDepartments from "../hooks/useDepartament";

import ShippingForm from "../components/shipping-form/ShippingForm";

export default function CreateShipping() {
  const {
    form,
    handleChange,
    submitForm,
    loading,
  } = useCreateShipping();

  const {
    departments = [],
    municipalities = [],
    selectedDepartment,
    setSelectedDepartment,
    loading: loadingCol,
  } = useDepartments();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitForm();
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };

  return (
    <ShippingForm
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
      loadingCol={loadingCol}
      departments={departments}
      municipalities={municipalities}
      selectedDepartment={selectedDepartment}
      setSelectedDepartment={setSelectedDepartment}
    />
  );
}