export const SORT_OPTIONS = [
  {
    name: "Default",
    value: "none",
  },
  {
    name: "Terbaru",
    value: "newest",
  },
  {
    name: "Harga: Rendah ke Tinggi",
    value: "price_asc",
  },
  {
    name: "Harga: Tinggi ke Rendah",
    value: "price_desc",
  },
] as const;

export const PRICE_FILTERS = {
  id: "price",
  name: "Harga",
  option: [
    {
      value: [0, 999999999],
      label: "Semua harga",
    },
    {
      value: [0, 1000000],
      label: "Dibawah Rp 1.000.000",
    },
    {
      value: [0, 5000000],
      label: "Dibawah Rp 5.000.000",
    },
    // custom option defined in jsx
  ],
} as const;
