import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from order data
export const generateOrderPDF = async (order, type = 'client') => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  let yPosition = margin;
  
  // Add header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Add order details
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Order #: ${order.order_number || order.id}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Status: ${order.status || 'N/A'}`, margin, yPosition);
  yPosition += 15;
  
  // Add customer/supplier information
  if (type === 'client' && order.supplier) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUPPLIER INFORMATION:', margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${order.supplier.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${order.supplier.email || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    if (order.supplier.phone) {
      pdf.text(`Phone: ${order.supplier.phone}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  } else if (type === 'supplier' && order.client) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLIENT INFORMATION:', margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Name: ${order.client.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Email: ${order.client.email || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    if (order.client.phone) {
      pdf.text(`Phone: ${order.client.phone}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;
  }
  
  // Add shipping information if available
  if (order.shipping_address) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('SHIPPING ADDRESS:', margin, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text(order.shipping_address, margin, yPosition);
    yPosition += 10;
  }
  
  // Add items table header
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITEMS:', margin, yPosition);
  yPosition += 8;
  
  // Table headers
  const colPositions = [margin, margin + 80, margin + 105, margin + 135];
  
  pdf.setFontSize(10);
  pdf.text('Product', colPositions[0], yPosition);
  pdf.text('Qty', colPositions[1], yPosition);
  pdf.text('Price', colPositions[2], yPosition);
  pdf.text('Total', colPositions[3], yPosition);
  yPosition += 8;
  
  // Add items
  pdf.setFont('helvetica', 'normal');
  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const productName = item.product?.name || item.name || 'Unknown Product';
      const quantity = item.quantity || 0;
      const unitPrice = parseFloat(item.unit_price || 0).toFixed(2);
      const total = parseFloat(item.total || 0).toFixed(2);
      
      pdf.text(productName.substring(0, 35), colPositions[0], yPosition);
      pdf.text(quantity.toString(), colPositions[1], yPosition);
      pdf.text(`$${unitPrice}`, colPositions[2], yPosition);
      pdf.text(`$${total}`, colPositions[3], yPosition);
      yPosition += 6;
    });
  }
  
  yPosition += 10;
  
  // Add totals
  const subtotal = parseFloat(order.subtotal || 0).toFixed(2);
  const discount = parseFloat(order.discount || 0).toFixed(2);
  const deliveryFee = parseFloat(order.delivery_fee || 0).toFixed(2);
  const finalTotal = parseFloat(order.total || 0).toFixed(2);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTALS:', margin + 100, yPosition);
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', margin + 100, yPosition);
  pdf.text(`$${subtotal}`, margin + 160, yPosition);
  yPosition += 6;
  
  if (parseFloat(discount) > 0) {
    pdf.text('Discount:', margin + 100, yPosition);
    pdf.text(`-$${discount}`, margin + 160, yPosition);
    yPosition += 6;
  }
  
  if (parseFloat(deliveryFee) > 0) {
    pdf.text('Delivery Fee:', margin + 100, yPosition);
    pdf.text(`$${deliveryFee}`, margin + 160, yPosition);
    yPosition += 6;
  }
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Final Total:', margin + 100, yPosition);
  pdf.text(`$${finalTotal}`, margin + 160, yPosition);
  
  // Add footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return pdf;
};

// Download PDF from HTML element
export const downloadPDFFromElement = async (elementId, filename = 'document.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Download order as PDF
export const downloadOrderPDF = async (order, type = 'client') => {
  try {
    const pdf = await generateOrderPDF(order, type);
    const filename = `order-${order.order_number || order.id}-${type}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error downloading order PDF:', error);
    throw error;
  }
}; 