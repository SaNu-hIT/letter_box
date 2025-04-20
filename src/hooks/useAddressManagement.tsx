import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  UserAddress,
} from "../services/auth";
import { useToast } from "../components/ui/use-toast";

export interface AddressData {
  id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default?: boolean;
  saveAddress?: boolean;
}

export function useAddressManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedFromAddressId, setSelectedFromAddressId] = useState<
    string | null
  >(null);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  // Default empty address
  const emptyAddress: AddressData = {
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    saveAddress: true,
  };

  // Load saved addresses when user is available
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  // Load saved addresses from the database
  const loadSavedAddresses = async () => {
    if (!user) return;

    try {
      setIsLoadingAddresses(true);
      const addresses = await getUserAddresses(user.id);
      setSavedAddresses(addresses);

      // Select default address if available
      const defaultAddress = addresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedFromAddressId(defaultAddress.id);
      } else if (addresses.length > 0) {
        setSelectedFromAddressId(addresses[0].id);
      }
    } catch (error) {
      console.error("Error loading saved addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load your saved addresses.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Save a new address
  const saveAddress = async (addressData: AddressData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save addresses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newAddress = await addUserAddress(
        user.id,
        addressData as UserAddress,
      );
      setSavedAddresses((prev) => [...prev, newAddress]);
      setSelectedFromAddressId(newAddress.id);

      toast({
        title: "Address Saved",
        description: "Your address has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error",
        description: "Failed to save your address. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update an existing address
  const editAddress = async (
    addressId: string,
    addressData: Partial<AddressData>,
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit addresses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdatingAddress(true);
      const updatedAddress = await updateUserAddress(
        addressId,
        addressData as Partial<UserAddress>,
      );

      // Update the address in the local state
      setSavedAddresses((prev) =>
        prev.map((addr) => (addr.id === addressId ? updatedAddress : addr)),
      );

      toast({
        title: "Address Updated",
        description: "Your address has been updated successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description: "Failed to update your address. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // Delete an address
  const removeAddress = async (addressId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete addresses.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsDeletingAddress(true);
      await deleteUserAddress(addressId);

      // Remove the address from the local state
      setSavedAddresses((prev) => prev.filter((addr) => addr.id !== addressId));

      // If the deleted address was selected, clear the selection
      if (selectedFromAddressId === addressId) {
        setSelectedFromAddressId(null);
      }

      toast({
        title: "Address Deleted",
        description: "Your address has been deleted successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete your address. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeletingAddress(false);
    }
  };

  // Get the currently selected address
  const getSelectedAddress = (): AddressData | null => {
    if (!selectedFromAddressId) return null;
    return (
      savedAddresses.find((addr) => addr.id === selectedFromAddressId) || null
    );
  };

  return {
    savedAddresses,
    isLoadingAddresses,
    isUpdatingAddress,
    isDeletingAddress,
    selectedFromAddressId,
    setSelectedFromAddressId,
    loadSavedAddresses,
    saveAddress,
    editAddress,
    removeAddress,
    getSelectedAddress,
    emptyAddress,
  };
}
