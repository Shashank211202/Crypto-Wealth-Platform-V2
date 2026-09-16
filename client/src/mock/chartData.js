// Generate a random walk for chart data
export const generateChartData = (days = 30, volatility = 0.02) => {
  const data = [];
  let price = 42000;
  const now = Math.floor(Date.now() / 1000);
  const start = now - (days * 24 * 60 * 60);

  for (let i = 0; i < days * 24; i++) { // Hourly points
      const change = 1 + (Math.random() * volatility * 2 - volatility);
      price = price * change;
      
      data.push({
          time: start + (i * 3600),
          price: price
      });
  }
  return data;
};

export const INITIAL_CHART_DATA = generateChartData(7);
