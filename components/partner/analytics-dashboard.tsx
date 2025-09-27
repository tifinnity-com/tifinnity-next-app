"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Mock Data
const monthlyData = [
  { name: "Jan", revenue: 4000, subscriptions: 24, orders: 45 },
  { name: "Feb", revenue: 3000, subscriptions: 13, orders: 50 },
  { name: "Mar", revenue: 5000, subscriptions: 38, orders: 60 },
  { name: "Apr", revenue: 4780, subscriptions: 29, orders: 55 },
  { name: "May", revenue: 5890, subscriptions: 48, orders: 70 },
  { name: "Jun", revenue: 4390, subscriptions: 38, orders: 65 },
];

const customerGrowth = [
  { name: "Jan", new: 10, total: 50 },
  { name: "Feb", new: 15, total: 65 },
  { name: "Mar", new: 20, total: 85 },
  { name: "Apr", new: 18, total: 103 },
  { name: "May", new: 25, total: 128 },
  { name: "Jun", new: 22, total: 150 },
];

const planDistribution = [
  { name: "Monthly", value: 400 },
  { name: "Weekly", value: 300 },
  { name: "Once", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function AnalyticsDashboard() {
  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Business Analytics
        </h1>
        <p className="text-muted-foreground">
          In-depth analysis of your mess performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsStatCard
          title="Total Revenue"
          value="₹27,060"
          change="+12.5%"
          icon={DollarSign}
        />
        <AnalyticsStatCard
          title="Total Subscriptions"
          value="190"
          change="+8.2%"
          icon={ShoppingCart}
        />
        <AnalyticsStatCard
          title="Total Orders"
          value="345"
          change="-3.1%"
          icon={Users}
          isDecrease
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>
            Revenue, subscriptions, and orders over the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                name="Revenue (₹)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="subscriptions"
                stroke="#82ca9d"
                name="Subscriptions"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#ffc658"
                name="Orders"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>
              New vs. Total customers over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total Customers" />
                <Bar dataKey="new" fill="#82ca9d" name="New Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>
              Popularity of different subscription plans.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {planDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsStatCard({
  title,
  value,
  change,
  icon: Icon,
  isDecrease = false,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  isDecrease?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs flex items-center ${
            isDecrease ? "text-red-500" : "text-green-500"
          }`}
        >
          {isDecrease ? (
            <TrendingDown className="h-4 w-4 mr-1" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-1" />
          )}
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
