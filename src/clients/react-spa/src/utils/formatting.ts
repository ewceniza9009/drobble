// This creates a formatter object. Creating it once is more efficient
// than creating it every time the function is called.
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PHP',
});

export const formatCurrency = (amount: number) => {
  return currencyFormatter.format(amount);
};