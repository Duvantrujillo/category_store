import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormField from "../../components/ui/FormField";

function RegisterForm({
  form,
  handleChange,
  handleSubmit,
  loading,
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">

      <Card className="w-96">

        <CardHeader>
          <CardTitle>Registrar usuario</CardTitle>
        </CardHeader>

        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">

            <FormField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black text-white py-2 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Registrar"}
            </button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}

export default RegisterForm;