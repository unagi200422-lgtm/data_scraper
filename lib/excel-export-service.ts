export interface ExportData {
  platform: string
  url: string
  data: any
  timestamp: string
}

export class ExcelExportService {
  static async exportToExcel(exportData: ExportData[]): Promise<void> {
    try {
      const response = await fetch("/api/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exportData }),
      })

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get("content-disposition")
      let filename = "scraped-data.xlsx"

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Excel export error:", error)
      throw new Error("Failed to export data to Excel")
    }
  }

  static async exportSingleResult(platform: string, url: string, data: any): Promise<void> {
    const exportData: ExportData[] = [
      {
        platform,
        url,
        data,
        timestamp: new Date().toISOString(),
      },
    ]

    return this.exportToExcel(exportData)
  }

  static async exportMultipleResults(results: Array<{ platform: string; url: string; data: any }>): Promise<void> {
    const exportData: ExportData[] = results.map((result) => ({
      platform: result.platform,
      url: result.url,
      data: result.data,
      timestamp: new Date().toISOString(),
    }))

    return this.exportToExcel(exportData)
  }
}
