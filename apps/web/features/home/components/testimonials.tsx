import { MessageSquare, Quote, Star } from "lucide-react";
import { getLatestReviews } from "@/actions/reviews";

// Fallback testimonials jika tidak ada review di database
const FALLBACK_TESTIMONIALS = [
  {
    id: "1",
    name: "Pelanggan Setia",
    rating: 5,
    body: "Kualitas produknya sangat bagus dan sesuai dengan deskripsi. Pengiriman juga cepat!",
    productTitle: "Produk Favorit",
  },
  {
    id: "2",
    name: "Pembeli Baru",
    rating: 5,
    body: "Pertama kali belanja di sini dan sangat puas. Pasti akan belanja lagi!",
    productTitle: "Koleksi Terbaru",
  },
  {
    id: "3",
    name: "Customer Happy",
    rating: 5,
    body: "Pelayanan ramah dan responsif. Produk original dan berkualitas tinggi.",
    productTitle: "Best Seller",
  },
];

export async function Testimonials() {
  const reviews = await getLatestReviews(3);

  // Gunakan data dari database atau fallback
  const testimonials =
    reviews.length > 0
      ? reviews.map((review) => ({
          id: review.id,
          name: review.user.name,
          avatar: review.user.image,
          rating: review.rating,
          body: review.body || review.title || "Review positif",
          productTitle: review.product?.title || null,
        }))
      : FALLBACK_TESTIMONIALS.map((t) => ({
          ...t,
          avatar: null,
        }));

  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-medium tracking-widest uppercase text-xs mb-3">
            ✦ Ulasan Pelanggan ✦
          </p>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3">
            Apa Kata Mereka?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Pengalaman nyata dari pelanggan yang sudah berbelanja di toko kami
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-background rounded-xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Quote className="w-4 h-4 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 text-sm leading-relaxed mb-4 line-clamp-3">
                "{testimonial.body}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {testimonial.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  {testimonial.productTitle && (
                    <p className="text-xs text-muted-foreground">
                      {testimonial.productTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {testimonials.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              Belum ada ulasan dari pelanggan
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
