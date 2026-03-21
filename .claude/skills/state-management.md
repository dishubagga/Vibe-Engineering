# Skill: State Management Patterns

> Redux Toolkit, Zustand, and Context API patterns.

## Redux Toolkit (Large Apps)

### Store Setup
```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slice with Async Thunk
```javascript
// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users');
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
```

### Using Redux in Components
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from './store/slices/userSlice';

export const UsersList = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {items.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## Zustand (Small to Medium Apps)

### Store Definition
```javascript
// store/useUserStore.js
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UserState {
  users: any[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: any) => void;
  clearUsers: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        users: [],
        loading: false,
        error: null,

        fetchUsers: async () => {
          set({ loading: true });
          try {
            const response = await fetch('/api/users');
            const users = await response.json();
            set({ users, loading: false, error: null });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        addUser: (user) => set((state) => ({
          users: [...state.users, user],
        })),

        clearUsers: () => set({ users: [], error: null }),
      }),
      { name: 'user-store' } // localStorage key
    )
  )
);
```

### Using Zustand in Components
```javascript
export const UsersList = () => {
  const { users, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## Context API (Simple State)

### Context Setup
```javascript
// context/UserContext.jsx
import { createContext, useState, useCallback } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = { users, loading, error, fetchUsers };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using context
export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within UserProvider');
  }
  return context;
};
```

### Using Context in Components
```javascript
export const UsersList = () => {
  const { users, loading, error, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

## When to Use What

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Context API** | Simple state (theme, auth) | Simple, no deps | Performance issues at scale |
| **Zustand** | Medium state | Lightweight, simple API | Less tooling |
| **Redux** | Complex state, multiple features | DevTools, time-travel | Boilerplate heavy |

## State Design Best Practices

1. **Normalize State**: Keep data flat
   ```javascript
   // ❌ Bad (nested)
   { users: { byId: { 1: { name: 'John', posts: [...] } } } }

   // ✅ Good (normalized)
   { users: [{ id: 1, name: 'John' }], posts: [{ id: 1, userId: 1 }] }
   ```

2. **Single Responsibility**: Each state slice handles one domain
   ```javascript
   // ✅ Good
   { auth: {...}, users: {...}, posts: {...} }
   ```

3. **Async State**: Handle loading, error, data
   ```javascript
   { loading: false, error: null, data: [...] }
   ```

4. **Immutability**: Never mutate state directly
   ```javascript
   // ✅ Good with Immer (Redux/Zustand handle this)
   state.users.push(newUser); // Works because of Immer
   ```

5. **Selectors**: Memoize derived data
   ```javascript
   // Redux
   const selectActiveUsers = (state) =>
     state.users.filter(u => u.active);

   // Zustand
   const activeUsers = useUserStore(
     useShallow(state => state.users.filter(u => u.active))
   );
   ```
