import { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDivide,
  FiCreditCard,
} from 'react-icons/fi';
import { HiInformationCircle } from 'react-icons/hi2';
import { CRYPTO_COINS } from '../../data/cryptoCoins';

const AddHoldingModal = ({
  isOpen = false,
  onClose,
  onAddHolding,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    coin: '',
    coin_symbol: '',
    quantity: '',
    buy_price: '',
    total_spent: '',
    currency: 'php',
    notes: '',
  });

  const [inputMode, setInputMode] = useState('perCoin');
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCoins, setFilteredCoins] = useState(CRYPTO_COINS);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;

    if (inputMode === 'perCoin') {
      // user enters price per coin calculate total spent
      const pricePerCoin = parseFloat(formData.buy_price) || 0;
      const total = quantity * pricePerCoin;
      setFormData((prev) => ({
        ...prev,
        total_spent: total > 0 ? total.toFixed(2) : '',
      }));
    } else {
      // user enters total spent  calculate price per coin
      const totalSpent = parseFloat(formData.total_spent) || 0;
      const pricePerCoin = quantity > 0 ? totalSpent / quantity : 0;
      setFormData((prev) => ({
        ...prev,
        buy_price: pricePerCoin > 0 ? pricePerCoin.toFixed(2) : '',
      }));
    }
  }, [formData.quantity, formData.buy_price, formData.total_spent, inputMode]);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCoins(CRYPTO_COINS.slice(0, 10));
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = CRYPTO_COINS.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query) ||
          coin.id.toLowerCase().includes(query)
      ).slice(0, 8);
      setFilteredCoins(filtered);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCoinSelect = (coin) => {
    setFormData({
      ...formData,
      coin: coin.id,
      coin_symbol: coin.symbol,
    });
    setSearchQuery(`${coin.name} (${coin.symbol})`);
    setShowDropdown(false);
    if (errors.coin) {
      setErrors((prev) => ({ ...prev, coin: '' }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // prevent negative values
    if (
      (name === 'quantity' || name === 'buy_price' || name === 'total_spent') &&
      parseFloat(value) < 0
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    setFormData((prev) => ({
      ...prev,
      total_spent: mode === 'perCoin' ? '' : prev.total_spent,
      buy_price: mode === 'totalSpent' ? '' : prev.buy_price,
    }));
    setErrors((prev) => ({
      ...prev,
      buy_price: '',
      total_spent: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.coin.trim()) {
      newErrors.coin = 'Please select a coin from the list';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (inputMode === 'perCoin') {
      if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
        newErrors.buy_price = 'Valid buy price is required';
      }
    } else {
      if (!formData.total_spent || parseFloat(formData.total_spent) <= 0) {
        newErrors.total_spent = 'Valid total spent is required';
      }
      if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
        newErrors.buy_price =
          'Cannot calculate price per coin - check your inputs';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // ALWAYS send price per coin to backend, regardless of input mode
    const holdingData = {
      coin: formData.coin,
      coin_symbol: formData.coin_symbol,
      quantity: parseFloat(formData.quantity),
      buy_price: parseFloat(formData.buy_price), // this is always price per coin
      currency: formData.currency,
      notes: formData.notes,
    };

    const result = await onAddHolding(holdingData);

    if (result.success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      coin: '',
      coin_symbol: '',
      quantity: '',
      buy_price: '',
      total_spent: '',
      currency: 'php',
      notes: '',
    });
    setInputMode('perCoin');
    setSearchQuery('');
    setErrors({});
    setShowDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={handleClose}
      />

      {/* MODAL */}
      <div className="bg-surface rounded-2xl shadow-2xl w-full mx-4 max-w-md border border-primary/20 transform animate-scale-in relative z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-primary to-primary/80 rounded-t-2xl sticky top-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-white">
              <HiInformationCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Add New Holding
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-1 sm:p-2 rounded-lg cursor-pointer"
          >
            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-surface">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Coin *
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className={`w-full pl-10 pr-10 py-2 sm:py-2 border rounded-lg bg-surface-light text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary text-base ${
                    errors.coin ? 'border-negative' : 'border-surface-border'
                  }`}
                  placeholder="Search for a coin..."
                />
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              </div>

              {showDropdown && filteredCoins.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 w-full mt-1 bg-surface border border-surface-border rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="max-h-48 sm:max-h-60 overflow-y-auto no-scrollbar">
                    {filteredCoins.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => handleCoinSelect(coin)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-surface-light border-b border-surface-border last:border-b-0 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm sm:text-base truncate">
                              {coin.name}
                            </div>
                            <div className="text-xs text-muted">
                              {coin.symbol}
                            </div>
                          </div>
                          <div className="text-xs text-muted bg-surface-light px-2 py-1 rounded ml-2 flex-shrink-0">
                            #{coin.id}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errors.coin && (
                <p className="text-negative text-sm mt-1">{errors.coin}</p>
              )}
            </div>

            {formData.coin && (
              <div
                className={`p-3 border rounded-lg ${
                  errors.coin
                    ? 'bg-negative/10 border-negative'
                    : 'bg-primary/10 border-primary/20'
                }`}
              >
                <div className="text-sm text-foreground">
                  <span className="font-medium">Selected:</span>{' '}
                  {CRYPTO_COINS.find((c) => c.id === formData.coin)?.name} (
                  {formData.coin_symbol})
                </div>
                <div className="text-xs text-muted mt-1">
                  Coin ID: {formData.coin}
                </div>
              </div>
            )}

            <div className="flex gap-2 p-2 bg-surface-light rounded-lg">
              <button
                type="button"
                onClick={() => handleInputModeChange('perCoin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
                  inputMode === 'perCoin'
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-surface-border'
                }`}
              >
                <FiCreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">
                  I know price per coin
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleInputModeChange('totalSpent')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all ${
                  inputMode === 'totalSpent'
                    ? 'bg-primary text-white'
                    : 'text-foreground hover:bg-surface-border'
                }`}
              >
                <FiDivide className="w-4 h-4" />
                <span className="text-sm font-medium">I know total spent</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity (coins) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                inputMode="decimal"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-surface-light text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary text-base ${
                  errors.quantity ? 'border-negative' : 'border-surface-border'
                }`}
                placeholder="0.00000000"
              />
              {errors.quantity && (
                <p className="text-negative text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {inputMode === 'perCoin' ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price per Coin (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="buy_price"
                  value={formData.buy_price}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-surface-light text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary text-base ${
                    errors.buy_price
                      ? 'border-negative'
                      : 'border-surface-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.buy_price && (
                  <p className="text-negative text-sm mt-1">
                    {errors.buy_price}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Total Spent (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="total_spent"
                  value={formData.total_spent}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-surface-light text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary text-base ${
                    errors.total_spent
                      ? 'border-negative'
                      : 'border-surface-border'
                  }`}
                  placeholder="0.00"
                />
                {errors.total_spent && (
                  <p className="text-negative text-sm mt-1">
                    {errors.total_spent}
                  </p>
                )}
                {errors.buy_price && !errors.total_spent && (
                  <p className="text-negative text-sm mt-1">
                    {errors.buy_price}
                  </p>
                )}
              </div>
            )}

            {/* preview display */}
            {formData.quantity &&
              (formData.buy_price || formData.total_spent) && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-foreground">
                      {inputMode === 'perCoin'
                        ? 'Total Spent:'
                        : 'Price per Coin:'}
                    </div>
                    <div className="text-lg font-bold text-accent">
                      {inputMode === 'perCoin'
                        ? `₱${(
                            parseFloat(formData.quantity) *
                            parseFloat(formData.buy_price)
                          ).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : `₱${parseFloat(formData.buy_price).toLocaleString(
                            'en-PH',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {inputMode === 'perCoin'
                      ? `${formData.quantity} × ₱${parseFloat(
                          formData.buy_price
                        ).toLocaleString('en-PH')} = ₱${(
                          parseFloat(formData.quantity) *
                          parseFloat(formData.buy_price)
                        ).toLocaleString('en-PH')}`
                      : `₱${parseFloat(formData.total_spent).toLocaleString(
                          'en-PH'
                        )} ÷ ${formData.quantity} = ₱${parseFloat(
                          formData.buy_price
                        ).toLocaleString('en-PH')} per coin`}
                  </div>
                </div>
              )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-light text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base no-scrollbar"
                placeholder="Add any notes about this purchase..."
              />
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 bg-surface rounded-b-2xl sticky bottom-0">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-foreground bg-surface-light border border-surface-border rounded-lg hover:bg-negative hover:text-white  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-white bg-accent rounded-lg hover:bg-accent/70 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <FiPlus className="w-4 h-4" />
                Add Holding
              </>
            )}
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

export default AddHoldingModal;
