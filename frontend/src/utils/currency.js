// Format amount to Indian Rupee currency
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0.00';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Parse and validate amount input
export const parseAmount = (input) => {
  if (typeof input === 'number') {
    return input > 0 ? input : null;
  }
  
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }
  
  return null;
};

// Calculate split amount per person
export const calculateSplitAmount = (totalAmount, numberOfPeople) => {
  if (!totalAmount || !numberOfPeople || numberOfPeople <= 0) {
    return 0;
  }
  return totalAmount / numberOfPeople;
};