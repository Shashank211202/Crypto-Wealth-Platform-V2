import { useMemo } from 'react';

export const useChartMath = (data, width, height, padding = 40) => {
  const calculations = useMemo(() => {
    if (!data || data.length === 0 || !width || !height) return null;

    // Find Min/Max
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minTime = Infinity;
    let maxTime = -Infinity;

    for (const point of data) {
      if (point.price < minPrice) minPrice = point.price;
      if (point.price > maxPrice) maxPrice = point.price;
      if (point.time < minTime) minTime = point.time;
      if (point.time > maxTime) maxTime = point.time;
    }

    // Add padding to Y-axis
    const priceRange = maxPrice - minPrice;
    const yPadding = priceRange * 0.1;
    const yMin = minPrice - yPadding;
    const yMax = maxPrice + yPadding;

    const xRange = maxTime - minTime;
    const yRange = yMax - yMin;

    // Pixel Mapping Functions
    const toPixels = (time, price) => {
      const x = padding + ((time - minTime) / xRange) * (width - 2 * padding);
      // Invert Y because canvas 0 is top
      const y = height - padding - ((price - yMin) / yRange) * (height - 2 * padding);
      return { x, y };
    };

    const fromPixelsX = (pixelX) => {
      const relativeX = pixelX - padding;
      const progress = relativeX / (width - 2 * padding);
      return minTime + (progress * xRange);
    };

    return {
      minPrice, maxPrice, minTime, maxTime,
      toPixels, fromPixelsX,
      chartArea: {
        left: padding,
        right: width - padding,
        top: padding,
        bottom: height - padding,
        width: width - 2 * padding,
        height: height - 2 * padding
      }
    };
  }, [data, width, height, padding]);

  return calculations;
};
