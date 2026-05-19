import { useState } from "react";
import { useRegister } from "@/hooks/useRegister";

import RegisterForm from "./components/RegisterForm";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { register, loading } = useRegister();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register(form);
  };

  return (
    <RegisterForm
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default RegisterPage;