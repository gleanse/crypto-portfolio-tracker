import {
  FiX,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiFileText,
  FiCreditCard,
} from 'react-icons/fi';
import { FaMoneyBills } from 'react-icons/fa6';
import { FaCoins } from 'react-icons/fa6';

const CoinDetailModal = ({ holding, onClose }) => {
  if (!holding) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="bg-surface rounded-2xl shadow-2xl w-full mx-4 max-w-md border border-primary/20 transform animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-primary to-primary/80 rounded-t-2xl sticky top-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-white">
              <FaCoins className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center gap-3">
              {holding.icon_url && (
                <img
                  src={holding.icon_url}
                  alt={holding.coin}
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
              )}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {holding.coin}
                </h3>
                <p className="text-white/80 text-sm uppercase">
                  {holding.coin_symbol}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-1 sm:p-2 rounded-lg cursor-pointer"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-6 bg-surface space-y-6">
          {/* BASIC INFORMATION CARD */}
          <div className="bg-surface-light border border-surface-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiCreditCard className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">
                Basic Information
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-1">Quantity</p>
                <p className="font-bold text-foreground text-lg">
                  {holding.quantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Currency</p>
                <p className="font-bold text-foreground text-lg uppercase">
                  {holding.currency}
                </p>
              </div>
            </div>
          </div>

          {/* PRICE INFORMATION CARD */}
          <div className="bg-surface-light border border-surface-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaMoneyBills className="w-4 h-4 text-secondary" />
              <h4 className="font-semibold text-foreground">
                Price Information
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Buy Price/Coin</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(holding.buy_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Current Price/Coin</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(holding.current_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Total Invested</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(holding.total_invested)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Current Value</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(holding.current_value)}
                </span>
              </div>
            </div>
          </div>

          {/* PROFIT/LOSS CARD */}
          <div
            className={`border rounded-xl p-4 ${
              holding.profit_loss >= 0
                ? 'bg-positive/10 border-positive/20'
                : 'bg-negative/10 border-negative/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {holding.profit_loss >= 0 ? (
                <FiTrendingUp className="w-4 h-4 text-positive" />
              ) : (
                <FiTrendingDown className="w-4 h-4 text-negative" />
              )}
              <h4 className="font-semibold text-foreground">Profit & Loss</h4>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted mb-1">Amount</p>
                <p
                  className={`text-xl font-bold ${
                    holding.profit_loss >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {formatCurrency(holding.profit_loss)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted mb-1">Percentage</p>
                <p
                  className={`text-xl font-bold ${
                    holding.profit_loss >= 0 ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {holding.profit_loss_percentage?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* NOTES CARD */}
          {holding.notes && (
            <div className="bg-surface-light border border-surface-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FiFileText className="w-4 h-4 text-accent" />
                <h4 className="font-semibold text-foreground">Notes</h4>
              </div>
              <div className="bg-surface border border-surface-border rounded-lg p-3">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                  {holding.notes}
                </p>
              </div>
            </div>
          )}

          {/* DATE INFORMATION CARD */}
          <div className="bg-surface-light border border-surface-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiCalendar className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Added Date</h4>
            </div>
            <div className="bg-surface border border-surface-border rounded-lg p-3">
              <p className="text-foreground font-medium text-sm">
                {formatDate(holding.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 bg-surface rounded-b-2xl sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-foreground bg-surface-light border border-surface-border rounded-lg hover:bg-negative hover:text-white transition-all duration-200 cursor-pointer font-medium text-base"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* SCROLLBAR STYLES */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CoinDetailModal;
