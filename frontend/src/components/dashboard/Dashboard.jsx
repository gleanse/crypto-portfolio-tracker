import { useEffect, useState } from 'react';
import { useHoldings } from '../../hooks/useHoldings';
import {
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiRefreshCw,
  FiCreditCard,
  FiBarChart2,
  FiTrash2,
} from 'react-icons/fi';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AddHoldingModal from './AddHoldingModal';
import { usePolling } from '../../hooks/usePolling';
import CoinDetailModal from './CoinDetailModal';

const Dashboard = () => {
  const {
    holdings,
    portfolioStats,
    loading,
    error,
    fetchPortfolioData,
    deleteHolding,
    addHolding,
  } = useHoldings();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    holdingId: null,
    holdingName: '',
    isLoading: false,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  usePolling(() => {
    console.log('POLLING: Auto-refreshing portfolio data...');
    fetchPortfolioData();
  }, 76000);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPortfolioData();
    setIsRefreshing(false);
  };

  const handleAddHolding = async (holdingData) => {
    return await addHolding(holdingData);
  };

  const handleDeleteClick = (holdingId, holdingName) => {
    setDeleteModal({
      isOpen: true,
      holdingId,
      holdingName,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    const result = await deleteHolding(deleteModal.holdingId);

    if (result.success) {
      setDeleteModal({
        isOpen: false,
        holdingId: null,
        holdingName: '',
        isLoading: false,
      });
    } else {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      // TODO: make it toast notif
      console.error('Delete failed:', result.error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      holdingId: null,
      holdingName: '',
      isLoading: false,
    });
  };

  const handleCoinClick = (holding) => {
    setSelectedHolding(holding);
  };

  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading && !portfolioStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FiRefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-negative/20 rounded-full flex items-center justify-center mb-4">
            <FiTrendingDown className="w-8 h-8 text-negative" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Error loading portfolio
          </h2>
          <p className="text-muted mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="accent">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Crypto Portfolio
            </h1>
            <p className="text-sm text-muted">
              Track your cryptocurrency investments
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="primary"
              className="flex items-center gap-2"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="accent"
              className="flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* PORTFOLIO STATS CARDS */}
        {portfolioStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-6 border border-inputbrdr shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total Invested</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(portfolioStats.total_invested)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-inputbrdr shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <FiBarChart2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted">Current Value</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(portfolioStats.total_current_value)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-inputbrdr shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    portfolioStats.total_profit_loss >= 0
                      ? 'bg-positive/20'
                      : 'bg-negative/20'
                  }`}
                >
                  {portfolioStats.total_profit_loss >= 0 ? (
                    <FiTrendingUp className="w-5 h-5 text-positive" />
                  ) : (
                    <FiTrendingDown className="w-5 h-5 text-negative" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted">Total Profit/Loss</p>
                  <p
                    className={`text-xl font-bold ${
                      portfolioStats.total_profit_loss >= 0
                        ? 'text-positive'
                        : 'text-negative'
                    }`}
                  >
                    {formatCurrency(portfolioStats.total_profit_loss)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-inputbrdr shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <FiPieChart className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted">Coin Count</p>
                  <p className="text-xl font-bold text-foreground">
                    {portfolioStats.coin_count}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOLDINGS TABLE */}
        <div className="bg-card rounded-xl border border-inputbrdr shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-primary">
            <h2 className="text-xl font-bold text-white">Your Holdings</h2>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <FiPieChart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No holdings yet
              </h3>
              <p className="text-muted mb-4">
                Start by adding your first cryptocurrency holding
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="accent"
                className="flex items-center gap-2 mx-auto"
              >
                <FiPlus className="w-4 h-4" />
                Add First Holding
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Coin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Coins Owned
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Buy Price/Coin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Current Price/Coin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Total Worth
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Profit/Loss
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inputbrdr">
                    {holdings.map((holding) => (
                      <tr
                        key={holding.id}
                        className="hover:bg-inputbg cursor-pointer transition-colors"
                        onClick={() => handleCoinClick(holding)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {holding.icon_url && (
                              <img
                                src={holding.icon_url}
                                alt={holding.coin}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {holding.coin}
                              </div>
                              <div className="text-sm text-muted uppercase">
                                {holding.coin_symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatCurrency(holding.buy_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatCurrency(holding.current_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {formatCurrency(holding.current_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-medium ${
                              holding.profit_loss >= 0
                                ? 'text-positive'
                                : 'text-negative'
                            }`}
                          >
                            {formatCurrency(holding.profit_loss)}
                            <br />
                            <span className="text-xs">
                              ({holding.profit_loss_percentage?.toFixed(2)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(holding.id, holding.coin);
                            }}
                            className="text-negative hover:text-negative/80 transition-colors p-2 rounded-lg hover:bg-negative/10"
                            title="Delete holding"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* COINGECKO ATTRIBUTION - RIGHT UNDER THE TABLE */}
              <div className="px-6 py-4 bg-surface-light border-t border-inputbrdr">
                <div className="flex items-center justify-center text-xs text-muted">
                  <span>Powered by </span>
                  <a
                    href="https://www.coingecko.com/?utm_source=crypto-portfolio&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 font-bold hover:opacity-80 transition-opacity ml-1"
                  >
                    CoinGecko API
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ADD HOLDING MODAL */}
      <AddHoldingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddHolding={handleAddHolding}
        isLoading={loading}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        title="Delete Holding"
        message={`Are you sure you want to delete your ${deleteModal.holdingName} holding? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteModal.isLoading}
      />

      {/* COIN DETAIL MODAL */}
      <CoinDetailModal
        holding={selectedHolding}
        onClose={() => setSelectedHolding(null)}
      />
    </div>
  );
};

export default Dashboard;
