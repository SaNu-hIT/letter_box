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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, UserCog } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin?: boolean;
};

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
            is_admin: user.is_admin || false,
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
        .select("id, name, email, created_at, is_admin");

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
          is_admin: user.is_admin || false,
        }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error

      toast({
        title: "Error loading users",
        description:
          "There was a problem loading the user list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email);
    setEditIsAdmin(user.is_admin || false);
    setIsEditing(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleting(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: editName,
          email: editEmail,
          is_admin: editIsAdmin,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: editName,
                email: editEmail,
                is_admin: editIsAdmin,
              }
            : user,
        ),
      );

      toast({
        title: "User updated",
        description: "User information has been successfully updated.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the user information.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // First try to delete from auth (this would typically be done via an edge function in production)
      // For this demo, we'll just delete from the users table
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(users.filter((user) => user.id !== selectedUser.id));

      toast({
        title: "User deleted",
        description: "User has been successfully removed.",
      });

      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Delete failed",
        description: "There was a problem deleting the user.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.id?.toLowerCase().includes(query)
    );
  });

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <UserCog className="h-8 w-8 text-purple-800" />
              <h1 className="text-3xl font-bold text-purple-800">
                User Management
              </h1>
            </div>
            <Button onClick={() => fetchUsers()}>Refresh</Button>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Search by name, email or ID..."
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
                    <TableHead>Admin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
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
                        <TableCell>
                          {user.is_admin ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              User
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Edit User Dialog */}
          <Dialog
            open={isEditing}
            onOpenChange={(open) => !open && setIsEditing(false)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isAdmin" className="text-right">
                    Admin
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox
                      id="isAdmin"
                      checked={editIsAdmin}
                      onCheckedChange={(checked) =>
                        setEditIsAdmin(checked as boolean)
                      }
                    />
                    <Label htmlFor="isAdmin">Grant admin privileges</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={saveUserChanges}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Dialog */}
          <Dialog
            open={isDeleting}
            onOpenChange={(open) => !open && setIsDeleting(false)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedUser && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p>
                      <strong>Name:</strong> {selectedUser.name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedUser.email}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleting(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser}>
                  Delete User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminRoute>
  );
};

export default UserManagementPage;
