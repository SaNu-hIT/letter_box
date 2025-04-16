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
      // Directly use the auth admin API to get users
      const { data: authData, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        console.error("Error fetching users from auth:", authError);
        throw authError;
      }

      if (authData && authData.users) {
        const formattedUsers = authData.users.map((user) => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error
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
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Sign In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.id.substring(0, 8)}...
                        </TableCell>
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
