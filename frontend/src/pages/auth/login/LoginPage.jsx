import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import LoginForm from "./components/LoginForm";

function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 👇 IMPORTANTE: ahora enviamos objeto
    login(form);
  };

  return (
    <LoginForm
      form={form}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
}

export default LoginPage;