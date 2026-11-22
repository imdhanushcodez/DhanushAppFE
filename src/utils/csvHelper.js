// CSV Helper with CSV Injection Protection (US-25, US-27) and Parsing (US-26, US-28)

/**
 * Escapes CSV field value and prevents formula injection
 */
export const sanitizeCsvField = (value) => {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Neutralize spreadsheet formula injection (=, +, -, @)
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }
  // If string contains comma, quote, or newline, wrap in quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generates and triggers download of a CSV file
 */
export const downloadCsv = (filename, headers, rows) => {
  const headerLine = headers.map(sanitizeCsvField).join(',');
  const rowLines = rows.map((row) =>
    headers.map((header) => sanitizeCsvField(row[header] || '')).join(',')
  );
  const csvContent = [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses simple CSV content to array of objects
 */
export const parseCsv = (text) => {
  const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      if (val.startsWith("'")) val = val.substring(1);
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }
  return { headers, rows };
};

