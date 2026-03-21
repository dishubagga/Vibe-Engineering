import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/Header';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { fetchUsers } from '../store/slices/userSlice';

export default function Users() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filtered = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <>
      <Header />
      <main className="container">
        <h1>Users Management</h1>
        
        {error && <Error message={error} onRetry={() => dispatch(fetchUsers())} />}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="results-count">{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center">No users found</p>
        ) : (
          <div className="users-grid">
            {filtered.map((user) => (
              <div key={user.id} className="user-card">
                <h3>{user.name}</h3>
                <p className="email">{user.email}</p>
                {user.phone && <p className="phone">{user.phone}</p>}
                <span className={`badge badge-${user.status?.toLowerCase()}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
