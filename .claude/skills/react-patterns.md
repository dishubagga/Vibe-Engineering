# Skill: React Patterns & Components

> Reusable patterns for React 18.2.0 component development.

## Folder Structure

```
src/
├── components/           # Reusable components
│   ├── Button.jsx
│   ├── Modal.jsx
│   └── Card.jsx
├── pages/                # Page-level components (routes)
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── DashboardPage.jsx
├── hooks/                # Custom hooks
│   ├── useApi.js
│   └── useMutation.js
├── services/             # API clients
│   ├── authService.js
│   └── userService.js
├── store/                # State management
│   └── slices/
│       ├── authSlice.js
│       └── userSlice.js
├── styles/               # Global styles
│   └── globals.css
└── App.jsx
```

## Functional Component Pattern

```javascript
// src/components/UserCard.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const UserCard = ({ userId, onSelect }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="card" onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

UserCard.propTypes = {
  userId: PropTypes.number.isRequired,
  onSelect: PropTypes.func,
};
```

## Component Composition

```javascript
// Compose smaller components
export const UserList = ({ users }) => (
  <div className="list">
    {users.map(user => (
      <UserCard key={user.id} userId={user.id} />
    ))}
  </div>
);

// Page component
export const UsersPage = () => {
  const { users, loading } = useUsers();

  if (loading) return <LoadingSpinner />;

  return (
    <PageLayout>
      <Header title="Users" />
      <UserList users={users} />
    </PageLayout>
  );
};
```

## Hooks Best Practices

### Custom Hook Pattern
```javascript
// hooks/useApi.js
export const useApi = (url) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (isMounted) setState({ data, loading: false, error: null });
      } catch (error) {
        if (isMounted) setState({ data: null, loading: false, error });
      }
    };

    fetch();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [url]);

  return state;
};
```

## Props Destructuring

```javascript
// ❌ Bad
export const Button = (props) => (
  <button onClick={props.onClick}>{props.label}</button>
);

// ✅ Good
export const Button = ({ onClick, label, disabled = false }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

// ✅ With PropTypes
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
```

## Error Boundaries

```javascript
// components/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Memoization for Performance

```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize component to prevent re-renders
export const UserCard = memo(({ user, onSelect }) => (
  <div onClick={() => onSelect(user.id)}>{user.name}</div>
));

// Memoize expensive computations
export const Dashboard = ({ users }) => {
  const totalUsers = useMemo(() => users.length, [users]);

  return <div>Total: {totalUsers}</div>;
};

// Memoize callback to prevent re-creating function
export const UserList = ({ users }) => {
  const handleSelect = useCallback((userId) => {
    console.log('Selected:', userId);
  }, []);

  return users.map(user => (
    <UserCard key={user.id} user={user} onSelect={handleSelect} />
  ));
};
```

## Controlled vs Uncontrolled Components

```javascript
// Controlled component (React manages state)
export const SearchInput = () => {
  const [search, setSearch] = useState('');

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
};

// Uncontrolled component (DOM manages state)
export const FileUpload = () => {
  const fileInput = useRef(null);

  const handleSubmit = () => {
    const file = fileInput.current.files[0];
    // Use file
  };

  return (
    <div>
      <input ref={fileInput} type="file" />
      <button onClick={handleSubmit}>Upload</button>
    </div>
  );
};
```
