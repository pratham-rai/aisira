export async function exportToExcel(data, fileName, sheetName = 'Sheet1') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Dynamically load SheetJS (XLSX) from CDN if not already loaded
  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    document.head.appendChild(script);
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load SheetJS library'));
    });
  }

  // Process data to format for Excel
  const processedData = data.map(item => {
    const formatted = {};
    for (const [key, value] of Object.entries(item)) {
      if (Array.isArray(value)) {
        formatted[key] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        formatted[key] = JSON.stringify(value);
      } else {
        formatted[key] = value;
      }
    }
    return formatted;
  });

  const worksheet = XLSX.utils.json_to_sheet(processedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
