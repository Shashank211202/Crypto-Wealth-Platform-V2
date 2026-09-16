export const useSkeleton = (count = 1) => {
  return Array(count).fill(0).map((_, i) => i);
};
