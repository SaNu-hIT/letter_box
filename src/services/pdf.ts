import jsPDF from "jspdf";
import QRCode from "qrcode";

export interface LetterPdfOptions {
  message: string;
  recipientName: string;
  recipientAddress?: string;
  style?: string;
  createdAt?: string;
  id?: string;
  deliverySpeed?: string;
}

// Generate PDF for a letter with the same design as the preview
export async function generateLetterPdf(options: LetterPdfOptions) {
  try {
    const {
      message,
      recipientName,
      style = "classic",
      id = `letter-${Date.now()}`,
    } = options;

    // Create a new PDF document
    const pdf = new jsPDF();

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Calculate margins to center content
    const horizontalMargin = 20;
    const verticalMargin = 20;
    const contentWidth = pageWidth - horizontalMargin * 2;
    const contentHeight = pageHeight - verticalMargin * 2;

    // Generate QR code for the letter with more stylish design
    const qrCodeDataUrl = await QRCode.toDataURL(
      `${window.location.origin}/reply/${id}`,
      {
        margin: 2,
        width: 100,
        color: {
          dark:
            style === "romantic"
              ? "#C9366F"
              : style === "vintage"
                ? "#5D4037"
                : style === "poetic"
                  ? "#4A4A8C"
                  : style === "modern"
                    ? "#222222"
                    : "#333333",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
        type: "image/png",
      },
    );

    // Set colors based on style
    const styleColors = {
      classic: {
        bg: [249, 244, 232],
        text: [51, 51, 51],
        border: [212, 201, 168],
      },
      modern: {
        bg: [255, 255, 255],
        text: [34, 34, 34],
        border: [221, 221, 221],
      },
      vintage: {
        bg: [245, 232, 208],
        text: [93, 64, 55],
        border: [190, 163, 141],
      },
      poetic: {
        bg: [248, 245, 255],
        text: [74, 74, 74],
        border: [216, 200, 240],
      },
      romantic: {
        bg: [255, 240, 245],
        text: [155, 50, 80],
        border: [240, 180, 200],
      },
    };

    const colors =
      styleColors[style as keyof typeof styleColors] || styleColors.classic;

    // Add decorative border
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(horizontalMargin, verticalMargin, contentWidth, contentHeight); // Border around the page

    // Add background color
    pdf.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    pdf.rect(
      horizontalMargin,
      verticalMargin,
      contentWidth,
      contentHeight,
      "F",
    );

    // Calculate vertical spacing for content
    const headerY = verticalMargin + 20;
    const headerLineY = headerY + 20;
    const messageStartY = headerLineY + 15;
    const footerLineY = pageHeight - verticalMargin - 50;
    const signatureY = footerLineY - 20;

    // Add recipient section
    pdf.setFont(style === "modern" ? "helvetica" : "times", "normal");
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFontSize(12);
    pdf.text("To: ", horizontalMargin + 10, headerY);
    pdf.setFont(style === "modern" ? "helvetica" : "times", "bold");
    pdf.text(recipientName, horizontalMargin + 25, headerY);

    // Add message content with decorative elements
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.setLineWidth(0.2);
    pdf.line(
      horizontalMargin + 10,
      headerLineY,
      pageWidth - horizontalMargin - 10,
      headerLineY,
    ); // Separator line

    pdf.setFont(
      style === "modern" ? "helvetica" : "times",
      style === "poetic" ? "italic" : "normal",
    );
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.setFontSize(12);

    // Handle long messages with text wrapping
    const messageWidth = contentWidth - 40; // Margins on both sides
    const splitMessage = pdf.splitTextToSize(message, messageWidth);

    // Center the message vertically in the available space
    const messageHeight = splitMessage.length * 12 * 1.2; // Approximate height based on font size and line spacing
    const availableMessageSpace = footerLineY - messageStartY;
    const messageY =
      messageStartY + (availableMessageSpace - messageHeight) / 2;

    pdf.text(splitMessage, pageWidth / 2, messageY, { align: "center" });

    // Add signature
    pdf.setFont(style === "modern" ? "helvetica" : "times", "italic");
    pdf.text("With love,", pageWidth - horizontalMargin - 10, signatureY, {
      align: "right",
    });
    pdf.text(
      "An anonymous admirer",
      pageWidth - horizontalMargin - 10,
      signatureY + 10,
      { align: "right" },
    );

    // Add closing line
    pdf.line(
      horizontalMargin + 10,
      footerLineY,
      pageWidth - horizontalMargin - 10,
      footerLineY,
    ); // Bottom separator line

    // Add QR code with decorative frame - centered on page
    const qrSize = 70;
    // Center horizontally on the page
    const qrX = (pageWidth - qrSize) / 2;
    // Center vertically in the bottom section
    const qrY =
      footerLineY +
      10 +
      (pageHeight - footerLineY - verticalMargin - 30 - qrSize) / 2;

    // Add decorative frame around QR code
    pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    pdf.setLineWidth(1);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 5, 5, "S");

    // Create a semi-transparent background for the QR code
    pdf.setFillColor(255, 255, 255);
    pdf.setGState(new pdf.GState({ opacity: 0.5 }));
    pdf.rect(qrX, qrY, qrSize, qrSize, "F");

    // Reset opacity for the QR code itself
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    // Add QR code
    pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Add QR code caption
    pdf.setFont(style === "modern" ? "helvetica" : "times", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    pdf.text("Scan to reply anonymously", pageWidth / 2, qrY + qrSize + 15, {
      align: "center",
    });

    // Save the PDF
    pdf.save(`Letter-${id.substring(0, 8)}.pdf`);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
