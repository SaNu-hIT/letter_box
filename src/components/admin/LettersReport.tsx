import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { supabase } from "../../services/auth";
import { format } from "date-fns";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Printer } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

type Letter = {
  id: string;
  message: string;
  recipient_name: string;
  recipient_address: string;
  status: string;
  delivery_speed: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

const LettersReport: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("pending");
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  useEffect(() => {
    fetchLetters();
  }, [statusFilter]);

  async function fetchLetters() {
    setLoading(true);
    try {
      let query = supabase
        .from("letters")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      console.log("Fetched letters in report:", data);

      if (error) throw error;

      console.log("Fetched letters:", data);
      setLetters(data || []);
    } catch (error) {
      console.error("Error fetching letters:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateLetterStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("letters")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Update the local state
      setLetters((prevLetters) =>
        prevLetters.map((letter) =>
          letter.id === id
            ? {
                ...letter,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : letter,
        ),
      );
    } catch (error) {
      console.error("Error updating letter status:", error);
    }
  }

  async function updateMultipleLetterStatus(ids: string[], newStatus: string) {
    try {
      // Update each letter in sequence
      for (const id of ids) {
        const { error } = await supabase
          .from("letters")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
      }

      // Update the local state
      setLetters((prevLetters) =>
        prevLetters.map((letter) =>
          ids.includes(letter.id)
            ? {
                ...letter,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : letter,
        ),
      );

      // Clear selection after successful update
      setSelectedLetters([]);
    } catch (error) {
      console.error("Error updating multiple letter status:", error);
    }
  }

  // Generate PDF for a single letter
  async function generateLetterPdf(letter: Letter) {
    try {
      setGeneratingPdf(true);

      // Create a new PDF document
      const pdf = new jsPDF();

      // Generate QR code for the letter
      const qrCodeDataUrl = await QRCode.toDataURL(
        `https://loveletter.com/reply/${letter.id}`,
        {
          margin: 1,
          width: 60,
          color: {
            dark: "#000",
            light: "#FFF",
          },
        },
      );

      // Add decorative border
      pdf.setDrawColor(200, 150, 200); // Light purple
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, 190, 277); // Border around the page

      // Add romantic header
      pdf.setFillColor(250, 240, 245); // Very light pink
      pdf.rect(10, 10, 190, 30, "F");

      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(128, 0, 128); // Purple
      pdf.setFontSize(24);
      pdf.text("Love Letter", 105, 25, { align: "center" });

      // Add date
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.setFontSize(10);
      pdf.text(
        `${format(new Date(letter.created_at), "MMMM d, yyyy")}`,
        105,
        35,
        { align: "center" },
      );

      // Add recipient section
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFontSize(12);
      pdf.text("Dear ", 20, 55);
      pdf.setFont("helvetica", "bold");
      pdf.text(letter.recipient_name, 35, 55);
      pdf.setFont("helvetica", "normal");
      pdf.text(letter.recipient_address, 20, 65);

      // Add delivery method
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.text(`Delivery: ${letter.delivery_speed}`, 20, 80);

      // Add message content with decorative elements
      pdf.setDrawColor(200, 150, 200); // Light purple
      pdf.setLineWidth(0.2);
      pdf.line(20, 90, 190, 90); // Separator line

      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFontSize(12);

      // Handle long messages with text wrapping
      const splitMessage = pdf.splitTextToSize(letter.message, 150);
      pdf.text(splitMessage, 30, 105);

      // Add closing line
      pdf.line(20, 240, 190, 240); // Bottom separator line

      // Add QR code
      pdf.addImage(qrCodeDataUrl, "PNG", 85, 245, 40, 40);

      // Add QR code caption
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100); // Gray
      pdf.text("Scan to reply anonymously", 105, 275, { align: "center" });

      // Save the PDF
      pdf.save(`Letter-${letter.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGeneratingPdf(false);
    }
  }

  // Generate PDF for multiple letters
  async function generateMultipleLettersPdf(letters: Letter[]) {
    try {
      setGeneratingPdf(true);

      // Create a new PDF document
      const pdf = new jsPDF();

      // Process each letter on a separate page
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];

        // Add a new page for each letter except the first one
        if (i > 0) {
          pdf.addPage();
        }

        // Generate QR code for the letter
        const qrCodeDataUrl = await QRCode.toDataURL(
          `https://loveletter.com/reply/${letter.id}`,
          {
            margin: 1,
            width: 60,
            color: {
              dark: "#000",
              light: "#FFF",
            },
          },
        );

        // Add decorative border
        pdf.setDrawColor(200, 150, 200); // Light purple
        pdf.setLineWidth(0.5);
        pdf.rect(10, 10, 190, 277); // Border around the page

        // Add romantic header
        pdf.setFillColor(250, 240, 245); // Very light pink
        pdf.rect(10, 10, 190, 30, "F");

        // Add title
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(128, 0, 128); // Purple
        pdf.setFontSize(24);
        pdf.text("Love Letter", 105, 25, { align: "center" });

        // Add date
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.setFontSize(10);
        pdf.text(
          `${format(new Date(letter.created_at), "MMMM d, yyyy")}`,
          105,
          35,
          { align: "center" },
        );

        // Add recipient section
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0); // Black
        pdf.setFontSize(12);
        pdf.text("Dear ", 20, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text(letter.recipient_name, 35, 55);
        pdf.setFont("helvetica", "normal");
        pdf.text(letter.recipient_address, 20, 65);

        // Add delivery method
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text(`Delivery: ${letter.delivery_speed}`, 20, 80);

        // Add message content with decorative elements
        pdf.setDrawColor(200, 150, 200); // Light purple
        pdf.setLineWidth(0.2);
        pdf.line(20, 90, 190, 90); // Separator line

        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(0, 0, 0); // Black
        pdf.setFontSize(12);

        // Handle long messages with text wrapping
        const splitMessage = pdf.splitTextToSize(letter.message, 150);
        pdf.text(splitMessage, 30, 105);

        // Add closing line
        pdf.line(20, 240, 190, 240); // Bottom separator line

        // Add QR code
        pdf.addImage(qrCodeDataUrl, "PNG", 85, 245, 40, 40);

        // Add QR code caption
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text("Scan to reply anonymously", 105, 275, { align: "center" });
      }

      // Save the PDF
      pdf.save("Love-Letters.pdf");
    } catch (error) {
      console.error("Error generating multiple PDFs:", error);
    } finally {
      setGeneratingPdf(false);
    }
  }

  // Filter letters based on search query
  const filteredLetters = letters.filter((letter) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      letter.recipient_name.toLowerCase().includes(query) ||
      letter.recipient_address.toLowerCase().includes(query) ||
      letter.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Letters Report</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search by recipient or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="printed">Printed</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3 flex justify-end gap-2">
          {selectedLetters.length > 0 && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Update {selectedLetters.length} Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Multiple Letters</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="bulk-status">New Status</Label>
                    <Select
                      value={bulkStatusValue}
                      onValueChange={setBulkStatusValue}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="printed">Printed</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end mt-4 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLetters([])}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          updateMultipleLetterStatus(
                            selectedLetters,
                            bulkStatusValue,
                          );
                        }}
                      >
                        Update Letters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() =>
                  generateMultipleLettersPdf(
                    filteredLetters.filter((letter) =>
                      selectedLetters.includes(letter.id),
                    ),
                  )
                }
                disabled={generatingPdf}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print {selectedLetters.length} Selected
              </Button>
            </>
          )}
          <Button onClick={() => fetchLetters()}>Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedLetters.length === filteredLetters.length &&
                      filteredLetters.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLetters(
                          filteredLetters.map((letter) => letter.id),
                        );
                      } else {
                        setSelectedLetters([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Speed</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLetters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No letters found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLetters.map((letter) => (
                  <TableRow key={letter.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLetters.includes(letter.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLetters([...selectedLetters, letter.id]);
                          } else {
                            setSelectedLetters(
                              selectedLetters.filter((id) => id !== letter.id),
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {letter.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{letter.recipient_name}</TableCell>
                    <TableCell>
                      {letter.recipient_address.substring(0, 20)}
                      {letter.recipient_address.length > 20 ? "..." : ""}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          letter.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : letter.status === "printed"
                              ? "bg-blue-100 text-blue-800"
                              : letter.status === "sent"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                        {letter.status}
                      </span>
                    </TableCell>
                    <TableCell>{letter.delivery_speed}</TableCell>
                    <TableCell>
                      {format(new Date(letter.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          defaultValue={letter.status}
                          onValueChange={(value) =>
                            updateLetterStatus(letter.id, value)
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="printed">Printed</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateLetterPdf(letter)}
                          disabled={generatingPdf}
                        >
                          <Printer className="h-4 w-4" />
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
    </div>
  );
};

export default LettersReport;
