export function detectRegion(address: {
  city?: string | null;
  province?: string | null;
}) {
  if (!address.city && !address.province) return "unknown";

  const city = (address.city || "").toLowerCase();
  const province = (address.province || "").toLowerCase();

  // --- Jabodetabek ---
  const jabodetabek = [
    "jakarta",
    "jakarta selatan",
    "jakarta barat",
    "jakarta timur",
    "jakarta pusat",
    "bogor",
    "depok",
    "tangerang",
    "bekasi",
  ];

  if (jabodetabek.some((c) => city.includes(c) || province.includes(c))) {
    return "jabodetabek";
  }

  // --- Pulau Jawa ---
  const jawaProvinces = [
    "banten",
    "dki jakarta",
    "jawa barat",
    "jawa tengah",
    "jawa timur",
    "di yogyakarta",
  ];

  if (jawaProvinces.some((p) => province.includes(p))) {
    return "jawa";
  }

  // --- Luar Jawa ---
  return "luar_jawa";
}
