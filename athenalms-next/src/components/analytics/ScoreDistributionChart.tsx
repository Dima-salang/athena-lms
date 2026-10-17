"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ScoreDistributionItem {
  label: string;
  count: number;
  percentage: number;
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionItem[];
  className?: string;
}

const COLORS = [
  "#10b981", // Outstanding: Emerald
  "#3b82f6", // Very Satisfactory: Blue
  "#6366f1", // Satisfactory: Indigo
  "#f59e0b", // Fairly Satisfactory: Amber
  "#ef4444", // Did Not Meet: Red
];

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  data,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          DepEd Performance Level Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
            >
              <XAxis
                dataKey="label"
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(
                  value: unknown,
                  _name: unknown,
                  item: { payload?: { percentage?: number } }
                ) => [
                  `${value} student(s) (${item.payload?.percentage ?? 0}%)`,
                  "Count",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
