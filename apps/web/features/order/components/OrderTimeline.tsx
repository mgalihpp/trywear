import { format } from "date-fns";
import type { OrderStep } from "../types";

export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
  return (
    <div className="border border-border p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Status Pesanan</h2>
      <div className="block md:relative">
        {/* Desktop Timeline */}
        <div className="hidden md:block">
          <div className="absolute inset-x-0 top-6 flex items-center pointer-events-none">
            <div className="flex-1 flex justify-between items-center px-[80px]">
              {steps.map((_, index) => {
                if (index === steps.length - 1) return null;

                const isActive = steps[index + 1]?.active;

                return (
                  <div
                    key={index}
                    className="flex-1 flex items-center justify-center relative"
                  >
                    <div
                      className={`absolute w-full h-0.5 transition-all duration-500 ease-in-out ${
                        isActive ? "bg-foreground" : "bg-border"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const stepDate = step.date
                ? format(new Date(step.date), "dd MMM yyyy HH:mm")
                : null;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 relative z-10"
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-all ${
                      step.active
                        ? "bg-foreground border-foreground text-background scale-110"
                        : "border-border bg-background"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="text-center">
                    <p
                      className={`text-sm font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.label}
                    </p>
                    {step.active && stepDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stepDate} WIB
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepDate = step.date
              ? format(new Date(step.date), "dd MMM yyyy HH:mm")
              : null;

            return (
              <div key={index} className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      step.active
                        ? "bg-foreground border-foreground text-background"
                        : "border-border bg-background"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`absolute top-12 left-6 w-0.5 h-16 -translate-x-1/2 transition-all ${
                        steps[index + 1]?.active ? "bg-foreground" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <p
                    className={`font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </p>
                  {step.active && stepDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stepDate} WIB
                    </p>
                  )}
                  {step.active && !stepDate && (
                    <p className="text-sm text-muted-foreground mt-1">-</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
