"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import type { Diagnosis } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { FileText, Activity, AlertTriangle } from "lucide-react";

interface DashboardChartsProps {
  diagnoses: Diagnosis[];
}

const getConfidenceColor = (level: "High" | "Medium" | "Low") => {
  if (level === "High") return "hsl(var(--chart-2))";
  if (level === "Medium") return "hsl(var(--chart-4))";
  return "hsl(var(--chart-1))";
};

export function DashboardCharts({ diagnoses }: DashboardChartsProps) {
  const chartData = React.useMemo(() => {
    if (!diagnoses || diagnoses.length === 0) {
      return {
        diseaseFrequency: [],
        confidenceDistribution: [],
        recentActivity: [],
        totalDiagnoses: 0,
        mostCommonDisease: "N/A",
      };
    }

    const frequency = new Map<string, number>();
    diagnoses.forEach((d) => {
      d.possibleDiseases.forEach((disease) => {
        frequency.set(disease, (frequency.get(disease) || 0) + 1);
      });
    });
    const diseaseFrequency = Array.from(frequency.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const distribution: { [key in "High" | "Medium" | "Low"]: number } = { High: 0, Medium: 0, Low: 0 };
    diagnoses.forEach((d) => {
      distribution[d.confidenceLevel]++;
    });
    const confidenceDistribution = Object.entries(distribution)
      .map(([name, count]) => ({ name: name as "High" | "Medium" | "Low", count, fill: getConfidenceColor(name as "High" | "Medium" | "Low")}))
      .sort((a, b) => {
        if (a.name === 'High') return -1;
        if (b.name === 'High') return 1;
        if (a.name === 'Medium') return -1;
        if (b.name === 'Medium') return 1;
        return 0;
      });

    const recentActivityData = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      recentActivityData.set(format(date, "MMM d"), 0);
    }
    diagnoses.forEach(d => {
      const date = startOfDay(parseISO(d.timestamp));
      if (date >= subDays(new Date(), 6)) {
        const formattedDate = format(date, "MMM d");
        if (recentActivityData.has(formattedDate)) {
          recentActivityData.set(formattedDate, (recentActivityData.get(formattedDate) || 0) + 1);
        }
      }
    });
    const recentActivity = Array.from(recentActivityData.entries()).map(([name, diagnoses]) => ({ name, diagnoses }));
    
    const totalDiagnoses = diagnoses.length;
    const mostCommonDisease = diseaseFrequency[0]?.name || (totalDiagnoses > 0 ? "Various" : "N/A");

    return { diseaseFrequency, confidenceDistribution, recentActivity, totalDiagnoses, mostCommonDisease };
  }, [diagnoses]);

  const { diseaseFrequency, confidenceDistribution, recentActivity, totalDiagnoses, mostCommonDisease } = chartData;
  
  const chartConfig: ChartConfig = {
    diagnoses: { label: "Diagnoses", color: "hsl(var(--primary))" },
    count: { label: "Count" },
    High: { label: "High", color: getConfidenceColor("High") },
    Medium: { label: "Medium", color: getConfidenceColor("Medium") },
    Low: { label: "Low", color: getConfidenceColor("Low") },
  };

  if (totalDiagnoses === 0) {
    return null;
  }

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Number of diagnoses over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart accessibilityLayer data={recentActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} allowDecimals={false} />
              <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
              <Line type="monotone" dataKey="diagnoses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Diseases</CardTitle>
          <CardDescription>Most frequently diagnosed issues.</CardDescription>
        </CardHeader>
        <CardContent>
          {diseaseFrequency.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={diseaseFrequency} layout="vertical" margin={{ left: 20, right: 10 }}>
                <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} className="text-xs" tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value} width={130} interval={0} />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={5} background={{ fill: "hsl(var(--muted))", radius: 5 }} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">Not enough data to display.</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Confidence Breakdown</CardTitle>
           <CardDescription>Distribution of AI confidence levels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
            {confidenceDistribution.map(item => (
                <div key={item.name} className="flex items-center gap-4">
                    <span className="font-semibold w-16">{item.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-4 relative">
                        <div className="h-full rounded-full" style={{ width: `${(item.count / totalDiagnoses) * 100}%`, backgroundColor: item.fill}} />
                    </div>
                    <span className="font-mono text-sm text-muted-foreground w-12 text-right">{Math.round((item.count / totalDiagnoses) * 100)}%</span>
                </div>
            ))}
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>At-a-glance summary.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pt-4">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <FileText className="h-6 w-6"/>
                  </div>
                  <div>
                      <p className="text-sm text-muted-foreground">Total Diagnoses</p>
                      <p className="text-3xl font-bold">{totalDiagnoses}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Activity className="h-6 w-6"/>
                  </div>
                  <div>
                      <p className="text-sm text-muted-foreground">Most Common Issue</p>
                      <p className="text-lg font-semibold">{mostCommonDisease}</p>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>AI Assessment Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-4">
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                <AlertTriangle className="h-5 w-5"/>
              </div>
              <p className="text-sm text-muted-foreground">
                  The analyses provided are AI-generated and for informational purposes only. Always consult with a qualified veterinarian for a definitive diagnosis.
              </p>
          </CardContent>
      </Card>
    </div>
  );
}
