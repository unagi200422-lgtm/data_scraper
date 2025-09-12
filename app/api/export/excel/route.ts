import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

interface ExportData {
  platform: string
  url: string
  data: any
  timestamp: string
}

function formatLinkedInData(data: any): any[] {
  if (data.companyUrl) {
    // Company data
    return [
      {
        Platform: "LinkedIn",
        Type: "Company",
        Name: data.name,
        Industry: data.industry,
        Size: data.size,
        Location: data.location,
        Website: data.website,
        Followers: data.followers,
        About: data.about,
        URL: data.companyUrl,
        "Extracted At": data.extractedAt,
      },
    ]
  } else {
    // Profile data
    const baseProfile = {
      Platform: "LinkedIn",
      Type: "Profile",
      Name: data.name,
      Headline: data.headline,
      Location: data.location,
      Connections: data.connections,
      About: data.about,
      URL: data.profileUrl,
      "Extracted At": data.extractedAt,
    }

    const result = [baseProfile]

    // Add experience as separate rows
    if (data.experience && data.experience.length > 0) {
      data.experience.forEach((exp: any, index: number) => {
        result.push({
          Platform: "LinkedIn",
          Type: "Experience",
          Name: data.name,
          "Job Title": exp.title,
          Company: exp.company,
          Duration: exp.duration,
          Description: exp.description,
          "Experience #": index + 1,
          URL: data.profileUrl,
          "Extracted At": data.extractedAt,
        })
      })
    }

    // Add education as separate rows
    if (data.education && data.education.length > 0) {
      data.education.forEach((edu: any, index: number) => {
        result.push({
          Platform: "LinkedIn",
          Type: "Education",
          Name: data.name,
          School: edu.school,
          Degree: edu.degree,
          Field: edu.field,
          Years: edu.years,
          "Education #": index + 1,
          URL: data.profileUrl,
          "Extracted At": data.extractedAt,
        })
      })
    }

    // Add skills as a single row with comma-separated values
    if (data.skills && data.skills.length > 0) {
      result.push({
        Platform: "LinkedIn",
        Type: "Skills",
        Name: data.name,
        Skills: data.skills.join(", "),
        "Skills Count": data.skills.length,
        URL: data.profileUrl,
        "Extracted At": data.extractedAt,
      })
    }

    return result
  }
}

function formatGoogleBusinessData(data: any): any[] {
  const baseData = {
    Platform: "Google Business",
    Type: "Business",
    Name: data.name,
    Category: data.category,
    Address: data.address,
    Phone: data.phone,
    Website: data.website,
    Rating: data.rating,
    "Review Count": data.reviewCount,
    "Price Range": data.priceRange,
    Description: data.description,
    Coordinates: `${data.coordinates.lat}, ${data.coordinates.lng}`,
    URL: data.businessUrl,
    "Extracted At": data.extractedAt,
  }

  const result = [baseData]

  // Add hours as separate rows
  if (data.hours && data.hours.length > 0) {
    data.hours.forEach((hour: any, index: number) => {
      result.push({
        Platform: "Google Business",
        Type: "Hours",
        Name: data.name,
        Day: hour.day,
        Hours: hour.hours,
        "Hours #": index + 1,
        URL: data.businessUrl,
        "Extracted At": data.extractedAt,
      })
    })
  }

  // Add reviews as separate rows
  if (data.reviews && data.reviews.length > 0) {
    data.reviews.forEach((review: any, index: number) => {
      result.push({
        Platform: "Google Business",
        Type: "Review",
        Name: data.name,
        "Review Author": review.author,
        "Review Rating": review.rating,
        "Review Text": review.text,
        "Review Date": review.date,
        "Review #": index + 1,
        URL: data.businessUrl,
        "Extracted At": data.extractedAt,
      })
    })
  }

  // Add amenities as a single row
  if (data.amenities && data.amenities.length > 0) {
    result.push({
      Platform: "Google Business",
      Type: "Amenities",
      Name: data.name,
      Amenities: data.amenities.join(", "),
      "Amenities Count": data.amenities.length,
      URL: data.businessUrl,
      "Extracted At": data.extractedAt,
    })
  }

  return result
}

function formatFacebookData(data: any): any[] {
  if (data.pageUrl) {
    // Page data
    const baseData = {
      Platform: "Facebook",
      Type: "Page",
      Name: data.name,
      Category: data.category,
      Description: data.description,
      Address: data.address,
      Phone: data.phone,
      Website: data.website,
      Email: data.email,
      Rating: data.rating,
      "Review Count": data.reviewCount,
      Likes: data.likes,
      Followers: data.followers,
      "Check-ins": data.checkins,
      URL: data.pageUrl,
      "Extracted At": data.extractedAt,
    }

    const result = [baseData]

    // Add hours as separate rows
    if (data.hours && data.hours.length > 0) {
      data.hours.forEach((hour: any, index: number) => {
        result.push({
          Platform: "Facebook",
          Type: "Hours",
          Name: data.name,
          Day: hour.day,
          Hours: hour.hours,
          "Hours #": index + 1,
          URL: data.pageUrl,
          "Extracted At": data.extractedAt,
        })
      })
    }

    // Add posts as separate rows
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((post: any, index: number) => {
        result.push({
          Platform: "Facebook",
          Type: "Post",
          Name: data.name,
          "Post Content": post.content,
          "Post Date": post.date,
          "Post Likes": post.likes,
          "Post Comments": post.comments,
          "Post Shares": post.shares,
          "Post #": index + 1,
          URL: data.pageUrl,
          "Extracted At": data.extractedAt,
        })
      })
    }

    return result
  } else {
    // Profile data
    const baseData = {
      Platform: "Facebook",
      Type: "Profile",
      Name: data.name,
      Username: data.username,
      Bio: data.bio,
      Location: data.location,
      Website: data.website,
      Followers: data.followers,
      Following: data.following,
      Work: data.about?.work || "N/A",
      Education: data.about?.education || "N/A",
      Relationship: data.about?.relationship || "N/A",
      Hometown: data.about?.hometown || "N/A",
      Email: data.contact?.email || "N/A",
      Phone: data.contact?.phone || "N/A",
      URL: data.profileUrl,
      "Extracted At": data.extractedAt,
    }

    const result = [baseData]

    // Add posts as separate rows
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((post: any, index: number) => {
        result.push({
          Platform: "Facebook",
          Type: "Post",
          Name: data.name,
          "Post Content": post.content,
          "Post Date": post.date,
          "Post Likes": post.likes,
          "Post Comments": post.comments,
          "Post Shares": post.shares,
          "Post #": index + 1,
          URL: data.profileUrl,
          "Extracted At": data.extractedAt,
        })
      })
    }

    return result
  }
}

export async function POST(request: NextRequest) {
  try {
    const { exportData }: { exportData: ExportData[] } = await request.json()

    if (!exportData || exportData.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 400 })
    }

    // Format data for Excel
    let allFormattedData: any[] = []

    exportData.forEach((item) => {
      switch (item.platform) {
        case "linkedin":
          allFormattedData = allFormattedData.concat(formatLinkedInData(item.data))
          break
        case "google-business":
          allFormattedData = allFormattedData.concat(formatGoogleBusinessData(item.data))
          break
        case "facebook":
          allFormattedData = allFormattedData.concat(formatFacebookData(item.data))
          break
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Create main data sheet
    const mainSheet = XLSX.utils.json_to_sheet(allFormattedData)
    XLSX.utils.book_append_sheet(workbook, mainSheet, "Scraped Data")

    // Create summary sheet
    const summary = [
      { Metric: "Total Records", Value: allFormattedData.length },
      { Metric: "LinkedIn Records", Value: allFormattedData.filter((item) => item.Platform === "LinkedIn").length },
      {
        Metric: "Google Business Records",
        Value: allFormattedData.filter((item) => item.Platform === "Google Business").length,
      },
      { Metric: "Facebook Records", Value: allFormattedData.filter((item) => item.Platform === "Facebook").length },
      { Metric: "Export Date", Value: new Date().toISOString() },
    ]

    const summarySheet = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const filename = `scraped-data-${timestamp}.xlsx`

    // Return file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Excel export error:", error)
    return NextResponse.json({ error: "Failed to export data to Excel" }, { status: 500 })
  }
}
