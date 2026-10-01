const db = require('../config/db');
const PDFDocument = require('pdfkit');

/**
 * BRANDING CONFIG
 */
const BRAND = {
  USE_LOGO_IMAGE: false,
  LOGO_PATH: null,
  APP_NAME: 'SuaraWarga',
  APP_SUBTITLE: 'Laporan Pengaduan Masyarakat',
  ACCENT_COLOR: '#6FCF97',
  ACCENT_DARK: '#38A169',
  DARK_COLOR: '#1E293B',
  MUTED_COLOR: '#64748B',
  BORDER_COLOR: '#E2E8F0',
  ROW_EVEN: '#F8FAFC',
  ROW_ODD: '#FFFFFF',
};

/**
 * Parse lokasi dari body laporan.
 *
 * Format yang TERSIMPAN di DB (dari locationHelper.js / formatLocationForBody):
 *   \n\n---\n📍 Koordinat: -6.2000, 106.8166\n🗺️ Alamat: Jl. Sudirman, Jakarta
 *
 * Format alternatif lama [LOC:...] juga didukung.
 */
function parseLocationFromBody(body) {
  if (!body) return null;

  // Format utama: emoji-based (dari locationHelper.js)
  const coordRegex = /📍\s*Koordinat:\s*([-\d.]+)\s*,\s*([-\d.]+)/i;
  const addrRegex = /🗺️\s*Alamat:\s*(.+)/i;

  const coordMatch = body.match(coordRegex);
  const addrMatch = body.match(addrRegex);

  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    const address = addrMatch ? addrMatch[1].trim() : null;
    return { lat, lng, address };
  }

  // Format alternatif lama: [LOC:lat,lng,address]
  const legacyMatch = body.match(/\[LOC:([^\]]+)\]/);
  if (legacyMatch) {
    const raw = legacyMatch[1];
    const parts = raw.split(',');
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      const address = parts.slice(2).join(',').trim() || null;
      return { lat, lng, address };
    }
  }

  return null;
}

/**
 * Format lokasi untuk kolom PDF (maks ~65 karakter).
 */
function formatLocationText(locInfo) {
  if (!locInfo) return '-';
  if (locInfo.address && locInfo.address.length > 0) {
    const addr = locInfo.address;
    return addr.length > 65 ? addr.slice(0, 62) + '…' : addr;
  }
  return `${locInfo.lat.toFixed(5)}, ${locInfo.lng.toFixed(5)}`;
}

const exportReportsPdf = async (req, res) => {
  const { dateFrom, dateTo, status, category_id } = req.query;

  try {
    // ── BUILD QUERY ──────────────────────────────────────────
    const conditions = [];
    const params = [];

    if (dateFrom) { conditions.push('pr.created_at >= ?'); params.push(dateFrom + ' 00:00:00'); }
    if (dateTo)   { conditions.push('pr.created_at <= ?'); params.push(dateTo   + ' 23:59:59'); }
    if (status && status !== 'all') { conditions.push('pr.status = ?'); params.push(status); }
    if (category_id) { conditions.push('pr.category_id = ?'); params.push(category_id); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [reports] = await db.query(
      `SELECT pr.id, pr.header, pr.status, pr.created_at,
              u.username, u.email,
              c.category_name,
              pr.body
       FROM public_reports pr
       JOIN users u  ON pr.user_id    = u.id
       JOIN categories c ON pr.category_id = c.id
       ${where}
       ORDER BY pr.created_at DESC`,
      params
    );

    // ── SETUP PDF ─────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="laporan-pengaduan-${Date.now()}.pdf"`);
    doc.pipe(res);

    const pageW   = doc.page.width;   // 595
    const marginL = 40;
    const contentW = pageW - marginL * 2; // 515

    // ════════════════════════════════════════════════════════
    // HEADER
    // ════════════════════════════════════════════════════════

    // ── Logo circle ──
    doc.circle(marginL + 22, 54, 22)
       .fillAndStroke(BRAND.ACCENT_COLOR, BRAND.ACCENT_DARK);
    doc.fillColor('#FFFFFF').fontSize(13).font('Helvetica-Bold')
       .text('SW', marginL + 9, 46, { width: 26, align: 'center' });

    // ── App name ──
    doc.fillColor(BRAND.DARK_COLOR).fontSize(20).font('Helvetica-Bold')
       .text(BRAND.APP_NAME, marginL + 52, 36);
    doc.fillColor(BRAND.MUTED_COLOR).fontSize(9).font('Helvetica')
       .text(BRAND.APP_SUBTITLE, marginL + 52, 61);

    // ── Export info (kanan) ──
    const exportDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
    const exporterName = req.user?.username || 'Admin';
    doc.fillColor(BRAND.MUTED_COLOR).fontSize(8).font('Helvetica')
       .text(`Tanggal Export: ${exportDate}`, marginL, 36, { width: contentW, align: 'right' })
       .text(`Dicetak oleh: ${exporterName}`, marginL, 50, { width: contentW, align: 'right' });

    // ── Garis header ──
    const hLineY = 82;
    doc.moveTo(marginL, hLineY).lineTo(marginL + contentW, hLineY)
       .strokeColor(BRAND.ACCENT_COLOR).lineWidth(2.5).stroke();
    doc.moveTo(marginL, hLineY + 3).lineTo(marginL + contentW, hLineY + 3)
       .strokeColor(BRAND.ACCENT_COLOR).lineWidth(0.5).stroke();

    // ── Judul ──
    doc.fillColor(BRAND.DARK_COLOR).fontSize(13).font('Helvetica-Bold')
       .text('DAFTAR LAPORAN PENGADUAN', marginL, hLineY + 10, { width: contentW, align: 'center' });

    // ── Filter info ──
    const filterParts = [];
    if (dateFrom || dateTo) filterParts.push(`Periode: ${dateFrom || '(awal)'} s/d ${dateTo || '(akhir)'}`);
    if (status && status !== 'all') filterParts.push(`Status: ${status.toUpperCase()}`);

    let filterY = hLineY + 26;
    if (filterParts.length) {
      doc.fontSize(8).fillColor(BRAND.MUTED_COLOR).font('Helvetica')
         .text(filterParts.join('   ·   '), marginL, filterY, { width: contentW, align: 'center' });
      filterY += 12;
    }
    doc.fontSize(8).fillColor(BRAND.MUTED_COLOR).font('Helvetica')
       .text(`Total: ${reports.length} laporan`, marginL, filterY, { width: contentW, align: 'center' });

    // ════════════════════════════════════════════════════════
    // TABLE
    // ════════════════════════════════════════════════════════
    const tableTop = filterY + 14;

    // Kolom: No | ID | Judul/Pelapor | Kategori | Status | Tanggal | Lokasi
    const colWidths = [22, 30, 130, 72, 54, 58, 149];
    const headers   = ['No', 'ID', 'Judul / Pelapor', 'Kategori', 'Status', 'Tanggal', 'Lokasi Kejadian'];
    const startX    = marginL;

    // ── Header row ──
    const headerH = 18;
    doc.fillColor(BRAND.ACCENT_COLOR).rect(startX, tableTop, contentW, headerH).fill();
    doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold');
    let cx = startX + 3;
    headers.forEach((h, i) => {
      doc.text(h, cx, tableTop + 5, { width: colWidths[i] - 3, align: 'left' });
      cx += colWidths[i];
    });

    // ── Data rows ──
    let rowY = tableTop + headerH;

    const drawTableHeader = (y) => {
      doc.fillColor(BRAND.ACCENT_COLOR).rect(startX, y, contentW, headerH).fill();
      doc.fillColor('#FFFFFF').fontSize(7).font('Helvetica-Bold');
      let hx = startX + 3;
      headers.forEach((h, i) => {
        doc.text(h, hx, y + 5, { width: colWidths[i] - 3, align: 'left' });
        hx += colWidths[i];
      });
    };

    reports.forEach((r, idx) => {
      const isEven = idx % 2 === 0;
      const locInfo = parseLocationFromBody(r.body);
      const locText = formatLocationText(locInfo);

      // Row height berdasarkan panjang teks lokasi
      const rowH = locText.length > 40 ? 34 : 26;

      // Page break
      if (rowY + rowH > doc.page.height - 55) {
        doc.addPage();
        rowY = 45;
        drawTableHeader(rowY);
        doc.font('Helvetica').fontSize(7.5);
        rowY += headerH;
      }

      // Background
      doc.fillColor(isEven ? BRAND.ROW_EVEN : BRAND.ROW_ODD)
         .rect(startX, rowY, contentW, rowH).fill();

      // Border bottom
      doc.moveTo(startX, rowY + rowH).lineTo(startX + contentW, rowY + rowH)
         .strokeColor(BRAND.BORDER_COLOR).lineWidth(0.4).stroke();

      const statusColor = r.status === 'approved' ? '#059669'
                        : r.status === 'rejected'  ? '#DC2626' : '#D97706';

      const dateStr = new Date(r.created_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      const padTop = rowH === 34 ? 4 : 6;

      let dx = startX + 3;
      doc.font('Helvetica').fontSize(7.5);

      // No
      doc.fillColor(BRAND.DARK_COLOR)
         .text(String(idx + 1), dx, rowY + padTop, { width: colWidths[0] - 3, lineBreak: false, ellipsis: true });
      dx += colWidths[0];

      // ID
      doc.fillColor(BRAND.MUTED_COLOR)
         .text(`#${r.id}`, dx, rowY + padTop, { width: colWidths[1] - 3, lineBreak: false, ellipsis: true });
      dx += colWidths[1];

      // Judul / Pelapor
      doc.fillColor(BRAND.DARK_COLOR).font('Helvetica-Bold').fontSize(7.5)
         .text(r.header, dx, rowY + 4, { width: colWidths[2] - 4, lineBreak: false, ellipsis: true });
      doc.fillColor('#94A3B8').font('Helvetica').fontSize(6.5)
         .text(`${r.username} · ${r.email}`, dx, rowY + 15, { width: colWidths[2] - 4, lineBreak: false, ellipsis: true });
      doc.font('Helvetica').fontSize(7.5);
      dx += colWidths[2];

      // Kategori
      doc.fillColor(BRAND.DARK_COLOR)
         .text(r.category_name, dx, rowY + padTop, { width: colWidths[3] - 3, lineBreak: false, ellipsis: true });
      dx += colWidths[3];

      // Status (berwarna + bold)
      doc.fillColor(statusColor).font('Helvetica-Bold')
         .text(r.status.toUpperCase(), dx, rowY + padTop, { width: colWidths[4] - 3, lineBreak: false, ellipsis: true });
      doc.font('Helvetica');
      dx += colWidths[4];

      // Tanggal
      doc.fillColor(BRAND.DARK_COLOR)
         .text(dateStr, dx, rowY + padTop, { width: colWidths[5] - 3, lineBreak: false, ellipsis: true });
      dx += colWidths[5];

      // Lokasi (allow multi-line in rowH space)
      doc.fillColor(locInfo ? BRAND.MUTED_COLOR : '#CBD5E1')
         .text(locText, dx, rowY + 4, { width: colWidths[6] - 4, height: rowH - 8, ellipsis: true });

      rowY += rowH;
    });

    // Garis penutup tabel
    doc.moveTo(startX, rowY).lineTo(startX + contentW, rowY)
       .strokeColor(BRAND.ACCENT_DARK).lineWidth(1).stroke();

    // ════════════════════════════════════════════════════════
    // FOOTER setiap halaman
    // ════════════════════════════════════════════════════════
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i + range.start);
      const footerY = doc.page.height - 32;
      doc.moveTo(marginL, footerY - 6).lineTo(marginL + contentW, footerY - 6)
         .strokeColor(BRAND.BORDER_COLOR).lineWidth(0.5).stroke();
      doc.fillColor(BRAND.MUTED_COLOR).fontSize(7.5).font('Helvetica')
         .text(`${BRAND.APP_NAME} — ${BRAND.APP_SUBTITLE}`, marginL, footerY, { width: contentW / 2, align: 'left' })
         .text(`Halaman ${i + 1} dari ${range.count}`, marginL, footerY, { width: contentW, align: 'right' });
    }

    doc.end();
  } catch (err) {
    console.error('Export PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Gagal generate PDF', error: err.message });
    }
  }
};

module.exports = { exportReportsPdf };
