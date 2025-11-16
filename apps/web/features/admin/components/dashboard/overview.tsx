"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Total Penghasilan",
    value: "Rp 8.700.000",
    change: "+20.1%",
    icon: DollarSign,
    color: "text-emerald-600",
  },
  {
    title: "Total Pesanan",
    value: "1,234",
    change: "+15.3%",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    title: "Total Pelanggan",
    value: "892",
    change: "+8.2%",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "Growth Rate",
    value: "23.5%",
    change: "+4.3%",
    icon: TrendingUp,
    color: "text-orange-600",
  },
];

export function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-emerald-600 mt-1">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
