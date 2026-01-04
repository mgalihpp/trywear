"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStats } from "@/features/admin/queries/useDashboardQuery";
import { formatCurrency } from "@/features/admin/utils";

export function RevenueChart() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Gagal memuat data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.revenueByMonth.map((item) => ({
    ...item,
    revenue: item.revenue, // Already in Rupiah from API
  }));

  // Calculate max value for better Y-axis scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 0);
  const yAxisMax = maxRevenue > 0 ? maxRevenue * 1.2 : 1000000; // Add 20% padding or default 1M

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pendapatan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              domain={[0, yAxisMax]}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000)
                  return `${(value / 1000000).toFixed(1)}jt`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                return value.toString();
              }}
              width={60}
            />
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value),
                "Pendapatan",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
