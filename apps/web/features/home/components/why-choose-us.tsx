import { Headphones, RefreshCw, Shield, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Pembayaran Aman",
    description: "Transaksi aman dengan berbagai metode pembayaran terpercaya",
  },
  {
    icon: RefreshCw,
    title: "Garansi Produk",
    description: "Jaminan kualitas produk dengan garansi pengembalian",
  },
  {
    icon: Star,
    title: "Produk Berkualitas",
    description: "Hanya menjual produk original dengan kualitas terbaik",
  },
  {
    icon: Headphones,
    title: "Layanan Pelanggan",
    description: "Tim support siap membantu menjawab pertanyaan Anda",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-medium tracking-widest uppercase text-xs mb-3">
            ✦ Keunggulan Kami ✦
          </p>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3">
            Kenapa Belanja di Sini?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Kami berkomitmen memberikan pengalaman belanja terbaik untuk Anda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group text-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
