import { useState, useEffect } from 'react';
import api from '../services/api';

export const useApi = (url, options = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(url, options);
        setState({
          data: response.data.data,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error.response?.data?.message || error.message
        });
      }
    };

    fetchData();
  }, [url]);

  return state;
};

export const useMutation = (fn) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });

  const mutate = async (payload) => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await fn(payload);
      setState({
        data: response.data.data,
        loading: false,
        error: null
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setState({
        data: null,
        loading: false,
        error: errorMsg
      });
      throw error;
    }
  };

  return { ...state, mutate };
};
