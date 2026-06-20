import { useState, useEffect } from 'react';
import { getStats } from '../api/dashboardApi';

export function useDashboard({ skip = false } = {}) {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]     = useState(null);

  const fetchStats = async () => {
    if (skip) return;
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

  useEffect(() => { fetchStats(); }, [skip]); // eslint-disable-line react-hooks/exhaustive-deps

  return { stats, loading, error, refetch: fetchStats };
}
