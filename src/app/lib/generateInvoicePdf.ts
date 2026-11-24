import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export const generateInvoicePdfBuffer = (order: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = 595.28;
      const pageHeight = 841.89;

      // --- Jasivo Lifestyle অফিশিয়াল ব্র্যান্ড কালার প্যালেট ---
      const brandPurple = '#220B3B'; // মূল ডার্ক পার্পল কালার
      const brandLime = '#9DF83B'; // হাইলাইট লাইম গ্রিন কালার
      const textDark = '#18181B';
      const textMuted = '#52525B';
      const lightRowBg = '#F8F7FA'; // হালকা পার্পল-টিন্টেড গ্রে

      // --- ১. ডানপাশের সাইড ও বটম ব্র্যান্ড অ্যাকসেন্ট বার ---
      doc.rect(pageWidth - 10, 0, 10, pageHeight).fill(brandPurple);
      doc.rect(pageWidth - 10, 0, 10, 48).fill(brandLime);
      doc.rect(pageWidth - 10, 88, 10, 120).fill(brandLime);
      doc.rect(0, pageHeight - 8, pageWidth, 8).fill(brandPurple);

      // --- ২. বামপাশে আপনার আসল Jasivo লোগো ইমেজ ---
      const logoPath = path.join(process.cwd(), 'src', 'assets', 'jasivo-black-logo.png');

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 36, { width: 175 });
      } else {
        // ফাইল পাথ না পেলে ফলব্যাক টেক্সট লোগো
        doc.fillColor(brandPurple).fontSize(22).font('Helvetica-Bold').text('JASIVO', 50, 42);
        doc.fillColor(textMuted).fontSize(9).font('Helvetica').text('L I F E S T Y L E', 52, 66);
      }

      // --- ৩. ডানপাশে ফোল্ডেড রিবন স্টাইলের INVOICE ব্যানার ---
      // রিবনের ওপরের ফোল্ডেড অংশ (Lime Green)
      doc.polygon([420, 48], [445, 33], [492, 33], [492, 48]).fill(brandLime);

      // মূল Deep Purple রিবন ব্যানার
      doc.rect(420, 48, pageWidth - 420, 34).fill(brandPurple);

      doc.fillColor(brandLime).fontSize(19).font('Helvetica-Bold').text('INVOICE', 435, 56);

      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text(`INVOICE NO. #${order.orderNumber}`, 390, 90, {
          width: 165,
          align: 'right',
        });

      // হেডার নিচের ডিভাইডার লাইন
      doc.moveTo(50, 118).lineTo(545, 118).lineWidth(0.8).strokeColor('#D4D4D8').stroke();

      // --- ৪. Supplier এবং Client সেকশন ---
      const infoTop = 142;
      const addr = order.shippingAddress || {};

      // বাম কলাম: Supplier
      doc.fillColor(textDark).fontSize(9.5).font('Helvetica-Bold').text('Supplier:', 50, infoTop);

      doc
        .fillColor(brandPurple)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('JASIVO LIFESTYLE', 50, infoTop + 14);

      doc
        .fillColor(textMuted)
        .fontSize(8.5)
        .font('Helvetica')
        .text('Dhaka, Bangladesh', 50, infoTop + 34)
        .text('Email: support@jasivo.com', 50, infoTop + 46)
        .text('Web: www.jasivo.com', 50, infoTop + 58);

      // ডান কলাম: Client
      doc.fillColor(textDark).fontSize(9.5).font('Helvetica-Bold').text('Client:', 265, infoTop);

      doc
        .fillColor(brandPurple)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(
          (addr.recipientName || order.user?.name || 'VALUED CUSTOMER').toUpperCase(),
          265,
          infoTop + 14
        );

      doc
        .fillColor(textMuted)
        .fontSize(8.5)
        .font('Helvetica')
        .text(addr.streetAddress || addr.address || 'N/A', 265, infoTop + 34, {
          width: 240,
        })
        .text(
          `${addr.thana || ''}, ${addr.district || ''} ${addr.postalCode || ''}`,
          265,
          infoTop + 46
        )
        .text(`Phone: ${addr.phone || 'N/A'}`, 265, infoTop + 58);

      // --- ৫. Payment Method, Order Number ও Issue Date ---
      const metaTop = 238;
      doc
        .moveTo(50, metaTop - 12)
        .lineTo(545, metaTop - 12)
        .lineWidth(0.5)
        .strokeColor('#E4E4E7')
        .stroke();

      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Payment Method:  ', 50, metaTop, { continued: true })
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`${order.paymentMethod} (${order.paymentStatus})`);

      doc
        .fillColor(textDark)
        .font('Helvetica-Bold')
        .text('Order Number:       ', 50, metaTop + 15, { continued: true })
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`#${order.orderNumber}`);

      const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc
        .fillColor(textDark)
        .font('Helvetica-Bold')
        .text('Issue Date:   ', 265, metaTop, { continued: true })
        .font('Helvetica')
        .fillColor(textMuted)
        .text(formattedDate);

      // --- ৬. প্রোডাক্ট টেবিল হেডার (Deep Purple Bar + Lime Accent) ---
      const tableTop = 288;
      doc.rect(50, tableTop, 495, 28).fill(brandPurple);
      // টেবিল হেডারের নিচে চিকন Lime Green বর্ডার
      doc.rect(50, tableTop + 26, 495, 2.5).fill(brandLime);

      doc
        .fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('ITEM DESCRIPTION', 62, tableTop + 9)
        .text('PRICE', 315, tableTop + 9, { width: 65, align: 'center' })
        .text('QUANTITY', 390, tableTop + 9, { width: 65, align: 'center' })
        .text('TOTAL', 465, tableTop + 9, { width: 68, align: 'right' });

      // --- ৭. অর্ডার আইটেম রো ---
      let yPos = tableTop + 28.5;

      order.items.forEach((item: any, index: number) => {
        const rowHeight = 46;

        if (index % 2 === 1) {
          doc.rect(50, yPos, 495, rowHeight).fill(lightRowBg);
        }

        // বামপাশে ব্র্যান্ড ব্যাজ বক্স
        doc.rect(62, yPos + 8, 32, 30).fill(brandPurple);

        doc
          .fillColor(brandLime)
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('JSV', 62, yPos + 19, { width: 32, align: 'center' });

        // প্রোডাক্টের নাম ও সাইজ/কালার
        doc
          .fillColor(textDark)
          .fontSize(9.5)
          .font('Helvetica-Bold')
          .text(item.productName, 106, yPos + 10, { width: 200 });

        doc
          .fillColor(textMuted)
          .fontSize(8)
          .font('Helvetica')
          .text(`Size: ${item.size}  |  Color: ${item.color}`, 106, yPos + 24, {
            width: 200,
          });

        // দাম, পরিমাণ ও মোট
        doc
          .fillColor(textDark)
          .fontSize(9)
          .font('Helvetica')
          .text(`BDT ${Number(item.unitPrice).toFixed(2)}`, 315, yPos + 17, {
            width: 65,
            align: 'center',
          })
          .text(String(item.quantity), 390, yPos + 17, {
            width: 65,
            align: 'center',
          })
          .text(`BDT ${Number(item.totalPrice).toFixed(2)}`, 465, yPos + 17, {
            width: 68,
            align: 'right',
          });

        yPos += rowHeight;

        doc.moveTo(50, yPos).lineTo(545, yPos).lineWidth(0.5).strokeColor('#E4E4E7').stroke();
      });

      // --- ৮. বামপাশে Notes এবং ডানপাশে Subtotal / Total বক্স ---
      const summaryTop = yPos + 24;

      doc
        .fillColor(brandPurple)
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text('Notes:-', 50, summaryTop);

      doc
        .fillColor(textMuted)
        .fontSize(8)
        .font('Helvetica')
        .text(
          order.orderNote
            ? order.orderNote
            : 'Thank you for shopping with Jasivo Lifestyle. Please keep this invoice for warranty, exchange, or future reference.',
          50,
          summaryTop + 15,
          { width: 255, lineGap: 3 }
        );

      const labelX = 380;
      const valX = 460;
      let calcY = summaryTop;

      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Subtotal:', labelX, calcY)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`BDT ${Number(order.subtotal).toFixed(2)}`, valX, calcY, {
          width: 75,
          align: 'right',
        });

      calcY += 15;
      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Delivery:', labelX, calcY)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`BDT ${Number(order.deliveryCharge).toFixed(2)}`, valX, calcY, {
          width: 75,
          align: 'right',
        });

      calcY += 15;
      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Discount:', labelX, calcY)
        .font('Helvetica')
        .fillColor(textMuted)
        .text(`- BDT ${Number(order.discountAmount || 0).toFixed(2)}`, valX, calcY, {
          width: 75,
          align: 'right',
        });

      // Total বক্স (Deep Purple ব্যাকগ্রাউন্ড ও Lime Green টেক্সট)
      calcY += 22;
      doc.rect(labelX - 8, calcY - 6, 163, 25).fill(brandPurple);

      doc
        .fillColor('#FFFFFF')
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('Total', labelX, calcY)
        .fillColor(brandLime)
        .text(`BDT ${Number(order.totalAmount).toFixed(2)}`, valX - 10, calcY, {
          width: 85,
          align: 'right',
        });

      // --- ৯. সিগনেচার ---
      const signY = calcY + 52;
      doc
        .fillColor(brandPurple)
        .fontSize(13)
        .font('Helvetica-BoldOblique')
        .text('Jasivo Lifestyle', 415, signY, { width: 130, align: 'center' });

      doc
        .moveTo(430, signY + 16)
        .lineTo(530, signY + 16)
        .lineWidth(0.8)
        .strokeColor(brandPurple)
        .stroke();

      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('Authorized Signature', 415, signY + 20, {
          width: 130,
          align: 'center',
        });

      // --- ১০. ফুটার বক্স ও কন্টাক্ট বার ---
      const footerBoxY = pageHeight - 72;
      doc.rect(155, footerBoxY, 285, 22).lineWidth(1).strokeColor(brandPurple).stroke();

      doc
        .fillColor(textDark)
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .text('View this invoice online at ', 168, footerBoxY + 6, {
          continued: true,
        })
        .fillColor(brandPurple)
        .text('https://jasivo.com');

      doc
        .fillColor(textMuted)
        .fontSize(7.5)
        .font('Helvetica')
        .text(
          '+880 1700-000000   |   support@jasivo.com   |   www.jasivo.com   |   facebook.com/jasivolifestyle',
          50,
          pageHeight - 36,
          { width: 495, align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
