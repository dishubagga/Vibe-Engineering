import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { fetchUsers } from '../store/slices/userSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <Loading />;

  return (
    <>
      <Header />
      <main className="container">
        <h1>Dashboard</h1>
        {error && <Error message={error} onRetry={() => dispatch(fetchUsers())} />}
        <section className="stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
          </div>
        </section>
        
        <section className="users-list">
          <h2>Recent Users</h2>
          {users.length === 0 ? (
            <p className="text-center">No users found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status status-${user.status?.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
