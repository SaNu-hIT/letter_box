import React, { useState, useEffect } from "react";
import AdminRoute from "../../components/AdminRoute";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { supabase } from "../../services/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { format } from "date-fns";

type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at: string | null;
};

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Try to use the edge function to get users
      try {
        // First try the get_users edge function
        const { data, error } = await supabase.functions.invoke("get_users", {
          body: {},
        });

        if (!error && data?.users) {
          const formattedUsers = data.users.map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name || "",
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
          }));
          setUsers(formattedUsers);
          return;
        }
      } catch (edgeFunctionError) {
        console.log(
          "Edge function not available, using fallback",
          edgeFunctionError,
        );
      }

      // Fallback to direct database query if edge function fails
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, email, created_at");

      if (usersError) {
        console.error("Error fetching users from database:", usersError);
        throw usersError;
      }

      if (usersData) {
        const formattedUsers = usersData.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name || "",
          created_at: user.created_at,
          last_sign_in_at: null,
        }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error

      // Show error toast
      try {
        const { toast } = await import("@/components/ui/use-toast");
        toast({
          title: "Error loading users",
          description:
            "There was a problem loading the user list. Please try again.",
          variant: "destructive",
        });
      } catch (toastError) {
        console.error("Could not show error toast", toastError);
      }
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  });

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-purple-800">Users</h1>
            <Button onClick={() => fetchUsers()}>Refresh</Button>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search by email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Sign In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{user.name || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.created_at
                            ? format(new Date(user.created_at), "MMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at
                            ? format(
                                new Date(user.last_sign_in_at),
                                "MMM d, yyyy",
                              )
                            : "Never"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminUsersPage;
