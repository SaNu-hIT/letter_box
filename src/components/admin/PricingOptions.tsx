import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  getPricingOptions,
  createPricingOption,
  updatePricingOption,
  deletePricingOption,
  PricingOption,
} from "@/services/pricing";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";

const PricingOptions: React.FC = () => {
  const { toast } = useToast();
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentOption, setCurrentOption] = useState<Partial<PricingOption>>({
    name: "",
    description: "",
    price: 0,
    features: [],
    is_popular: false,
    delivery_speed: "standard",
    delivery_days: "",
    sort_order: 0,
  });
  const [newFeature, setNewFeature] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPricingOptions();
  }, []);

  const fetchPricingOptions = async () => {
    try {
      setIsLoading(true);
      const options = await getPricingOptions();
      setPricingOptions(options);
    } catch (error) {
      console.error("Error fetching pricing options:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing options.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setCurrentOption((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setCurrentOption((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setCurrentOption((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }));
  };

  const resetForm = () => {
    setCurrentOption({
      name: "",
      description: "",
      price: 0,
      features: [],
      is_popular: false,
      delivery_speed: "standard",
      delivery_days: "",
      sort_order: 0,
    });
    setIsEditing(false);
    setIsDialogOpen(false);
  };

  const handleEditOption = (option: PricingOption) => {
    setCurrentOption(option);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!currentOption.name || !currentOption.price) {
        toast({
          title: "Validation Error",
          description: "Name and price are required fields.",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && currentOption.id) {
        await updatePricingOption(
          currentOption.id,
          currentOption as PricingOption,
        );
        toast({
          title: "Success",
          description: "Pricing option updated successfully.",
        });
      } else {
        await createPricingOption(currentOption as PricingOption);
        toast({
          title: "Success",
          description: "Pricing option created successfully.",
        });
      }

      resetForm();
      fetchPricingOptions();
    } catch (error) {
      console.error("Error saving pricing option:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing option.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this pricing option?")
    ) {
      try {
        await deletePricingOption(id);
        toast({
          title: "Success",
          description: "Pricing option deleted successfully.",
        });
        fetchPricingOptions();
      } catch (error) {
        console.error("Error deleting pricing option:", error);
        toast({
          title: "Error",
          description: "Failed to delete pricing option.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-purple-800">
          Pricing Packages
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif text-purple-800">
                {isEditing ? "Edit Pricing Package" : "Add New Pricing Package"}
              </DialogTitle>
              <DialogDescription>
                Fill in the details for the pricing package. Click save when
                you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={currentOption.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Standard"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={currentOption.price}
                    onChange={(e) =>
                      handleInputChange("price", Number(e.target.value))
                    }
                    placeholder="799"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={currentOption.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="For the patient romantic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delivery_speed">Delivery Speed</Label>
                  <select
                    id="delivery_speed"
                    value={currentOption.delivery_speed}
                    onChange={(e) =>
                      handleInputChange("delivery_speed", e.target.value)
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_days">Delivery Time</Label>
                  <Input
                    id="delivery_days"
                    value={currentOption.delivery_days}
                    onChange={(e) =>
                      handleInputChange("delivery_days", e.target.value)
                    }
                    placeholder="5-7 days"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={currentOption.sort_order}
                    onChange={(e) =>
                      handleInputChange("sort_order", Number(e.target.value))
                    }
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_popular"
                    checked={currentOption.is_popular}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_popular", checked)
                    }
                  />
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {currentOption.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span>{feature}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
          <span className="ml-2 text-pink-700">Loading pricing options...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingOptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No pricing packages found. Create your first package.
                  </TableCell>
                </TableRow>
              ) : (
                pricingOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell className="font-medium">
                      <div>{option.name}</div>
                      <div className="text-xs text-gray-500">
                        {option.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      ₹{option.price.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="capitalize">{option.delivery_speed}</div>
                      <div className="text-xs text-gray-500">
                        {option.delivery_days}
                      </div>
                    </TableCell>
                    <TableCell>
                      {option.is_popular ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>{option.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOption(option)}
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PricingOptions;
