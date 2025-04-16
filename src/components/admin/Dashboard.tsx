import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart, Users, Mail, Printer, Send, Clock } from "lucide-react";
import { supabase } from "../../services/auth";

type MetricCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-pink-500">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalLetters: 0,
    pendingLetters: 0,
    printedLetters: 0,
    sentLetters: 0,
    deliveredLetters: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch letter counts by status
        const { data: letters, error: lettersError } = await supabase
          .from("letters")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("Fetched letters:", letters);
        if (lettersError) {
          console.error("Error fetching letters:", lettersError);
          throw lettersError;
        }

        // Fetch user count from auth schema
        const { data: authUsers, error: userError } = await supabase.auth.admin
          .listUsers()
          .catch((error) => {
            console.log("Error fetching auth users:", error);
            return { data: null, error };
          });

        const userCount = authUsers?.users?.length || 0;

        // If there's an error, just set count to 0 and continue
        if (userError) {
          console.error("Error fetching user count:", userError);
        }

        // Calculate metrics
        const pendingCount =
          letters?.filter((letter) => letter.status === "pending")?.length || 0;
        const printedCount =
          letters?.filter((letter) => letter.status === "printed")?.length || 0;
        const sentCount =
          letters?.filter((letter) => letter.status === "sent")?.length || 0;
        const deliveredCount =
          letters?.filter((letter) => letter.status === "delivered")?.length ||
          0;

        setMetrics({
          totalLetters: letters?.length || 0,
          pendingLetters: pendingCount,
          printedLetters: printedCount,
          sentLetters: sentCount,
          deliveredLetters: deliveredCount,
          totalUsers: userCount || 0,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-800">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/admin/letters">View All Letters</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total Letters"
                value={metrics.totalLetters}
                description="Total letters in the system"
                icon={<Mail />}
              />
              <MetricCard
                title="Pending Letters"
                value={metrics.pendingLetters}
                description="Letters waiting to be printed"
                icon={<Clock />}
              />
              <MetricCard
                title="Printed Letters"
                value={metrics.printedLetters}
                description="Letters that have been printed"
                icon={<Printer />}
              />
              <MetricCard
                title="Sent Letters"
                value={metrics.sentLetters}
                description="Letters that have been sent"
                icon={<Send />}
              />
              <MetricCard
                title="Delivered Letters"
                value={metrics.deliveredLetters}
                description="Letters that have been delivered"
                icon={<Mail />}
              />
              <MetricCard
                title="Total Users"
                value={metrics.totalUsers}
                description="Registered users"
                icon={<Users />}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed analytics will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
