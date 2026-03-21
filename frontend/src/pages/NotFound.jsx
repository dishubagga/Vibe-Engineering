import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </main>
  );
}
