import { useState, useEffect, useCallback } from "react";
import {
  fetchSummary,
  fetchReturnsReport,
  fetchRefundsReport,
  fetchShipmentsReport,
  fetchSalesReport,
} from "../api/reportApi";

function useReportData(fetcher, filters) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(filters);
      setData(result);
    } catch {
      setError("Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export const useSummaryReport   = (f) => useReportData(fetchSummary,         f);
export const useReturnsReport   = (f) => useReportData(fetchReturnsReport,   f);
export const useRefundsReport   = (f) => useReportData(fetchRefundsReport,   f);
export const useShipmentsReport = (f) => useReportData(fetchShipmentsReport, f);
export const useSalesReport     = (f) => useReportData(fetchSalesReport,     f);
