import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Charts() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: spendingData, isLoading: spendingLoading } = useQuery<Array<{ category: string; total: string }>>({
    queryKey: ["/api/analytics/spending"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/spending?month=${currentMonth}&year=${currentYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch spending data");
      return response.json();
    },
  });

  const { data: trendsData, isLoading: trendsLoading } = useQuery<Array<{ month: string; income: string; expenses: string }>>({
    queryKey: ["/api/analytics/trends"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/trends?months=6", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch trends data");
      return response.json();
    },
  });

  // Category chart data
  const categoryChartData = {
    labels: spendingData?.map(item => item.category) || [],
    datasets: [{
      data: spendingData?.map(item => parseFloat(item.total)) || [],
      backgroundColor: [
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#6b7280', // Gray
        '#ec4899', // Pink
        '#8b5cf6', // Purple
        '#84cc16', // Lime
        '#06b6d4', // Cyan
      ],
      borderWidth: 0,
    }]
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      }
    },
    cutout: '60%',
  };

  // Trends chart data
  const trendChartData = {
    labels: trendsData?.map(item => {
      const [year, month] = item.month.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Income',
        data: trendsData?.map(item => parseFloat(item.income)) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: trendsData?.map(item => parseFloat(item.expenses)) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Spending by Category Chart */}
      <Card data-testid="card-spending-chart">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {spendingLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : spendingData?.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No spending data</p>
                <p className="text-sm">Add some expense transactions to see your spending breakdown.</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <Doughnut data={categoryChartData} options={categoryChartOptions} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card data-testid="card-trends-chart">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : trendsData?.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No trend data</p>
                <p className="text-sm">Add transactions over multiple months to see trends.</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
