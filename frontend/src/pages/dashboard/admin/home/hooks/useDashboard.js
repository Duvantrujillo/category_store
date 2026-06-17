import { useState, useEffect } from 'react';
import { getStats } from '../api/dashboardApi';

export function useDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return { stats, loading, error, refetch: fetchStats };
}
