"use client";

import * as React from "react";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Diagnosis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DashboardChartsProps {
  diagnoses: Diagnosis[];
}

const getConfidenceColor = (level: "High" | "Medium" | "Low") => {
  if (level === "High") return "hsl(var(--chart-2))";
  if (level === "Medium") return "hsl(var(--chart-4))";
  return "hsl(var(--chart-1))";
};

export function DashboardCharts({ diagnoses }: DashboardChartsProps) {
  const diseaseFrequency = React.useMemo(() => {
    const frequency = new Map<string, number>();
    diagnoses.forEach((d) => {
      d.possibleDiseases.forEach((disease) => {
        frequency.set(disease, (frequency.get(disease) || 0) + 1);
      });
    });
    return Array.from(frequency.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [diagnoses]);

  const confidenceDistribution = React.useMemo(() => {
    const distribution: { [key in "High" | "Medium" | "Low"]: number } = {
      High: 0,
      Medium: 0,
      Low: 0,
    };
    diagnoses.forEach((d) => {
      distribution[d.confidenceLevel]++;
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name: name as "High" | "Medium" | "Low",
        value,
        fill: getConfidenceColor(name as "High" | "Medium" | "Low"),
      }))
      .filter((item) => item.value > 0);
  }, [diagnoses]);

  const totalDiagnoses = diagnoses.length;
  const mostCommonDisease = diseaseFrequency[0]?.name || "N/A";

  const barChartConfig = {
    count: {
      label: "Count",
    },
  } satisfies ChartConfig;

  const pieChartConfig = {
    value: {
      label: "Value",
    },
    High: {
      label: "High",
      color: getConfidenceColor("High"),
    },
    Medium: {
      label: "Medium",
      color: getConfidenceColor("Medium"),
    },
    Low: {
      label: "Low",
      color: getConfidenceColor("Low"),
    },
  } satisfies ChartConfig;

  if (totalDiagnoses === 0) {
    return null; // Don't render charts if there's no history
  }

  return (
    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 Diagnosed Diseases</CardTitle>
        </CardHeader>
        <CardContent>
          {diseaseFrequency.length > 0 ? (
            <ChartContainer config={barChartConfig} className="h-64 w-full">
              <BarChart
                accessibilityLayer
                data={diseaseFrequency}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs"
                  interval={0}
                  dy={-1}
                  width={120}
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={5}
                  background={{ fill: "hsl(var(--muted))", radius: 5 }}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Not enough data to display.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          {confidenceDistribution.length > 0 ? (
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square h-full max-h-52"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={confidenceDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  strokeWidth={5}
                >
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-muted-foreground">
              Not enough data to display.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Total Diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-4xl font-bold">{totalDiagnoses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Most Common Issue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xl font-semibold">{mostCommonDisease}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
