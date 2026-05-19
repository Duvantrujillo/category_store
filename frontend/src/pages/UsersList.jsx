import { useUsers } from "../hooks/useUsers";

function UsersList() {
  const { users, loading, error } = useUsers();

  if (loading) return <p>Cargando...</p>;

  if (error) return <p>Error al cargar usuarios</p>;

  return (
    <div>
      <h2>Usuarios registrados</h2>

      {users.map((user) => (
        <div key={user.id}>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}

export default UsersList;