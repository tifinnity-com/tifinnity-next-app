"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Mock data for profit and orders
const profitData = [
  { month: 'Jan', profit: 8500, orders: 145 },
  { month: 'Feb', profit: 11200, orders: 210 },
  { month: 'Mar', profit: 9200, orders: 175 },
  { month: 'Apr', profit: 14500, orders: 260 },
  { month: 'May', profit: 16200, orders: 290 },
  { month: 'Jun', profit: 12500, orders: 230 },
];

const paymentMethodData = [
  { name: 'Credit Card', value: 40 },
  { name: 'UPI', value: 35 },
  { name: 'Cash', value: 15 },
  { name: 'Wallet', value: 10 },
];

export default function VendorAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data loading
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-tifinnity-cream p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-tifinnity-green text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tifinnity-cream p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tifinnity-green mx-auto"></div>
          <p className="mt-4 text-tifinnity-gray">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tifinnity-cream p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tifinnity-green">Vendor Dashboard</h1>
        <p className="text-tifinnity-gray">Welcome back! Here's your business performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-tifinnity-green">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tifinnity-green">₹72,100</div>
            <p className="text-xs text-tifinnity-gray mt-1">+15.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-tifinnity-green">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tifinnity-green">1,310</div>
            <p className="text-xs text-tifinnity-gray mt-1">+8.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-tifinnity-green">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tifinnity-green">₹775</div>
            <p className="text-xs text-tifinnity-gray mt-1">+3.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-tifinnity-green">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tifinnity-green">28.5%</div>
            <p className="text-xs text-tifinnity-gray mt-1">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader>
            <CardTitle className="text-tifinnity-green">Orders & Profit Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#23412a" name="Orders" />
                  <Bar dataKey="profit" fill="#ff9800" name="Profit (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader>
            <CardTitle className="text-tifinnity-green">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full border-8 border-tifinnity-green flex items-center justify-center">
                    <span className="text-2xl font-bold text-tifinnity-green">+15.2%</span>
                  </div>
                </div>
                <p className="text-tifinnity-gray mb-4">Overall growth in profit compared to last period</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-tifinnity-green">Order Growth</p>
                    <p className="text-lg font-bold text-tifinnity-green">+8.3%</p>
                  </div>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-tifinnity-green">Margin Growth</p>
                    <p className="text-lg font-bold text-tifinnity-green">+2.1%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader>
            <CardTitle className="text-tifinnity-green">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodData.map((method, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-tifinnity-green">{method.name}</p>
                  </div>
                  <div className="text-tifinnity-green font-bold">{method.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-tifinnity-green shadow-md">
          <CardHeader>
            <CardTitle className="text-tifinnity-green">Order Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-tifinnity-green font-medium">Avg. Preparation Time</p>
                <p className="text-xl font-bold text-tifinnity-green">18 min</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-tifinnity-green font-medium">Peak Order Hours</p>
                <p className="text-xl font-bold text-tifinnity-green">12-2 PM</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg">
                <p className="text-tifinnity-green font-medium">Completion Rate</p>
                <p className="text-xl font-bold text-tifinnity-green">98.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-tifinnity-green shadow-md">
        <CardHeader>
          <CardTitle className="text-tifinnity-green">Monthly Profit & Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-tifinnity-gray">
              <thead className="text-xs uppercase bg-tifinnity-green text-white">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Profit</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {profitData.map((month, index) => (
                  <tr key={index} className="border-b hover:bg-secondary">
                    <td className="px-4 py-3 font-medium">{month.month}</td>
                    <td className="px-4 py-3">{month.orders}</td>
                    <td className="px-4 py-3 font-bold text-tifinnity-green">₹{month.profit.toLocaleString()}</td>
                    <td className="px-4 py-3">{((month.profit / (month.profit / 0.285)) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`${index > 0 && month.profit > profitData[index-1].profit ? 'text-green-600' : 'text-red-600'}`}>
                        {index > 0 ? `${((month.profit - profitData[index-1].profit) / profitData[index-1].profit * 100).toFixed(1)}%` : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}