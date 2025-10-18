import { useState } from 'react';
import { holdingsApi } from '../api/holdingsApi';

export const useHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingsApi.getMyPortfolio();
      setHoldings(response);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || 'Failed to fetch holdings';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingsApi.getPortfolioStats();
      setPortfolioStats(response);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || 'Failed to fetch portfolio stats';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const addHolding = async (holdingData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingsApi.addHolding(holdingData);

      // refresh holdings list after adding
      await fetchHoldings();
      await fetchPortfolioStats();

      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || 'Failed to add holding';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteHolding = async (holdingId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await holdingsApi.deleteHolding(holdingId);

      // refresh holdings list after deletion
      await fetchHoldings();
      await fetchPortfolioStats();

      return { success: true, data: response };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || 'Failed to delete holding';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // fetch both holdings and stats together
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchHoldings(), fetchPortfolioStats()]);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || 'Failed to fetch portfolio data';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    holdings,
    portfolioStats,
    loading,
    error,
    fetchHoldings,
    fetchPortfolioStats,
    addHolding,
    deleteHolding,
    fetchPortfolioData,
    clearError,
  };
};
