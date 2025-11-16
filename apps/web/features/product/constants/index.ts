export const SORT_OPTIONS = [
  {
    name: "None",
    value: "none",
  },
  {
    name: "Newest",
    value: "newest",
  },
  {
    name: "Price: Low to High",
    value: "price_asc",
  },
  {
    name: "Price: High to Low",
    value: "price_desc",
  },
] as const;

export const PRICE_FILTERS = {
  id: "price",
  name: "Price",
  option: [
    {
      value: [0, 1000000],
      label: "Semua harga",
    },
    {
      value: [0, 200000],
      label: "Dibawah Rp 200.000",
    },
    {
      value: [0, 500000],
      label: "Dibawah Rp 500.000",
    },
    // custom option defined in jsx
  ],
} as const;
