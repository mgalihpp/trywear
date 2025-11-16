/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type TabType = "description" | "specs" | "reviews" | "qa";

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("description");

  const tabs = [
    { id: "description" as TabType, label: "Details" },
    { id: "specs" as TabType, label: "Materials & Care" },
    { id: "reviews" as TabType, label: "Reviews" },
    { id: "qa" as TabType, label: "Q&A" },
  ];

  return (
    <div className="border-t border-border bg-secondary/30">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto">
          <div className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 bg-background">
        {activeTab === "description" && (
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Product Details</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                Our Essential Hoodie is the cornerstone of a minimalist
                wardrobe. Designed with a relaxed, oversized fit and crafted
                from a premium cotton-polyester blend, it offers unparalleled
                comfort for everyday wear.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                The hoodie features a soft brushed interior, adjustable
                drawstring hood, and a convenient kangaroo pocket. Its timeless
                design and neutral colorways make it incredibly versatile,
                perfect for layering or wearing on its own.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Features:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span>Oversized, relaxed fit for maximum comfort</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span>Premium cotton-polyester blend fabric</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span>Soft brushed fleece interior</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span>Adjustable drawstring hood</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground flex-shrink-0" />
                  <span>Ribbed cuffs and hem for shape retention</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Materials & Care</h3>
              <p className="text-muted-foreground">
                Our hoodies are crafted from premium materials for lasting
                quality and comfort.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold">Fabric Composition</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• 80% Premium Cotton</p>
                  <p>• 20% Polyester</p>
                  <p>• Weight: 320 GSM (Heavyweight)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Care Instructions</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Machine wash cold with similar colors</p>
                  <p>• Use mild detergent, avoid bleach</p>
                  <p>• Tumble dry low or hang dry</p>
                  <p>• Iron on low heat if needed</p>
                  <p>• Do not dry clean</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Fit & Sizing</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Oversized, relaxed fit</p>
                  <p>• True to size (size up for extra room)</p>
                  <p>• Model is 5'10" wearing size M</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Customer Reviews</h3>
              <div className="text-right">
                <p className="text-3xl font-bold">4.9</p>
                <p className="text-sm text-muted-foreground">
                  Based on 847 reviews
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  name: "Sarah M.",
                  date: "2 days ago",
                  rating: 5,
                  review:
                    "Absolutely love this hoodie! The quality is outstanding and the fit is perfect. It's become my go-to piece for casual days.",
                },
                {
                  name: "James K.",
                  date: "1 week ago",
                  rating: 5,
                  review:
                    "Best hoodie I've ever owned. The fabric is so soft and the oversized fit is exactly what I wanted. Worth every penny!",
                },
                {
                  name: "Emily R.",
                  date: "2 weeks ago",
                  rating: 4,
                  review:
                    "Great quality and very comfortable. Only wish there were more color options available. Still highly recommend!",
                },
              ].map((review, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-6 last:border-0"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {review.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? "fill-current" : "fill-none"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {review.review}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "qa" && (
          <div className="max-w-3xl space-y-8">
            <h3 className="text-2xl font-bold">Questions & Answers</h3>

            <div className="space-y-6">
              {[
                {
                  question: "What is the return policy?",
                  askedBy: "Michael",
                  date: "3 days ago",
                  answer:
                    "We offer a 30-day hassle-free return policy. If you're not completely satisfied with your purchase, you can return it for a full refund or exchange.",
                },
                {
                  question: "Is this hoodie pre-shrunk?",
                  askedBy: "Lisa",
                  date: "1 week ago",
                  answer:
                    "Yes, all our hoodies are pre-washed and pre-shrunk to ensure consistent sizing. We recommend following the care instructions to maintain the fit.",
                },
                {
                  question: "Do you ship internationally?",
                  askedBy: "Alex",
                  date: "2 weeks ago",
                  answer:
                    "Currently, we only ship within Indonesia. We're working on expanding our international shipping options. Stay tuned!",
                },
              ].map((qa, index) => (
                <div
                  key={index}
                  className="border-b border-border pb-6 last:border-0 space-y-4"
                >
                  <div>
                    <p className="font-semibold mb-1">Q: {qa.question}</p>
                    <p className="text-xs text-muted-foreground">
                      Asked by {qa.askedBy} · {qa.date}
                    </p>
                  </div>
                  <div className="pl-6 border-l-2 border-border">
                    <p className="text-muted-foreground leading-relaxed">
                      {qa.answer}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 font-medium">
                      Answered by Monowear
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
