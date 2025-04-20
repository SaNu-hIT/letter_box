import React, { useState } from "react";
import { AddressData } from "../hooks/useAddressManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import {
  CheckCircle,
  Loader2,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

interface AddressSelectionProps {
  savedAddresses: AddressData[];
  isLoadingAddresses: boolean;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
  selectedFromAddressId: string | null;
  setSelectedFromAddressId: (id: string | null) => void;
  onAddressSelect: (address: AddressData) => void;
  onAddressEdit: (
    addressId: string,
    addressData: Partial<AddressData>,
  ) => Promise<boolean>;
  onAddressDelete: (addressId: string) => Promise<boolean>;
  onAddNewAddress: () => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({
  savedAddresses,
  isLoadingAddresses,
  isUpdatingAddress,
  isDeletingAddress,
  selectedFromAddressId,
  setSelectedFromAddressId,
  onAddressSelect,
  onAddressEdit,
  onAddressDelete,
  onAddNewAddress,
}) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<AddressData | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressData | null>(
    null,
  );

  // Form state for editing address
  const [editFormData, setEditFormData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-600 mb-3">
        Select a saved address:
      </h4>
      {isLoadingAddresses ? (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
          <Loader2 className="h-5 w-5 text-pink-500 animate-spin mr-2" />
          <span>Loading addresses...</span>
        </div>
      ) : savedAddresses.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No saved addresses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-md p-3 transition-all hover:shadow-md ${selectedFromAddressId === address.id ? "border-pink-500 bg-pink-50" : "border-gray-200"}`}
            >
              <div className="flex justify-between items-start">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => {
                    setSelectedFromAddressId(address.id || "");
                    onAddressSelect(address);
                  }}
                >
                  <p className="font-medium">{address.address}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedFromAddressId === address.id && (
                    <div className="bg-pink-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-pink-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddressToEdit(address);
                      setEditFormData({
                        address: address.address,
                        city: address.city,
                        state: address.state,
                        zip: address.zip,
                        country: address.country || "India",
                      });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddressToDelete(address);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="mt-3 border-pink-200 text-pink-700 hover:bg-pink-50"
        onClick={onAddNewAddress}
      >
        <span className="mr-2">+</span> Add New Address
      </Button>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your saved address information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="edit_address">Street Address</Label>
                <Input
                  id="edit_address"
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      address: e.target.value,
                    })
                  }
                  className="mt-1"
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit_city">City</Label>
                  <Input
                    id="edit_city"
                    value={editFormData.city}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, city: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_state">State</Label>
                  <Input
                    id="edit_state"
                    value={editFormData.state}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        state: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit_zip">PIN Code</Label>
                  <Input
                    id="edit_zip"
                    value={editFormData.zip}
                    onChange={(e) => {
                      // Only allow numbers for PIN code
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setEditFormData({ ...editFormData, zip: value });
                    }}
                    maxLength={6}
                    className="mt-1"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_country">Country</Label>
                  <Input
                    id="edit_country"
                    value={editFormData.country}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        country: e.target.value,
                      })
                    }
                    className="mt-1"
                    placeholder="India"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!addressToEdit?.id) return;

                // Validate fields
                if (
                  !editFormData.address ||
                  !editFormData.city ||
                  !editFormData.state ||
                  !editFormData.zip ||
                  !editFormData.country
                ) {
                  toast({
                    title: "Incomplete Address",
                    description: "Please fill in all required address fields.",
                    variant: "destructive",
                  });
                  return;
                }

                if (editFormData.zip.length < 6) {
                  toast({
                    title: "Invalid PIN Code",
                    description: "PIN code must be 6 digits.",
                    variant: "destructive",
                  });
                  return;
                }

                const success = await onAddressEdit(
                  addressToEdit.id,
                  editFormData,
                );
                if (success) {
                  setIsEditDialogOpen(false);
                }
              }}
              disabled={isUpdatingAddress}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              {isUpdatingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" /> Update Address
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Address Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
              {addressToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{addressToDelete.address}</p>
                  <p className="text-sm text-gray-600">
                    {addressToDelete.city}, {addressToDelete.state}{" "}
                    {addressToDelete.zip}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addressToDelete.country}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setAddressToDelete(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={async () => {
                if (!addressToDelete?.id) return;

                try {
                  const success = await onAddressDelete(addressToDelete.id);
                  if (success) {
                    toast({
                      title: "Address Deleted",
                      description:
                        "Your address has been successfully deleted.",
                    });
                  }
                } catch (error) {
                  console.error("Error deleting address:", error);
                  toast({
                    title: "Error",
                    description:
                      "Failed to delete the address. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setAddressToDelete(null);
                  setIsDeleteDialogOpen(false);
                }
              }}
              disabled={isDeletingAddress}
            >
              {isDeletingAddress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />{" "}
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddressSelection;
