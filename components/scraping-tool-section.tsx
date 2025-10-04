"use client"
import { useEffect } from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/lib/icons"
import { ScrapingService } from "@/lib/scraping-service"
import { ExcelExportService } from "@/lib/excel-export-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LinkedInBookmarklet } from "@/components/linkedin-bookmarklet"

type PlatformType = "linkedin" | "google-business" | "facebook"
type ScrapingStatus = "idle" | "scraping" | "success" | "error"

interface ScrapingResult {
  platform: PlatformType
  url: string
  status: ScrapingStatus
  data?: any
  error?: string
}

export function ScrapingToolSection() {
  const [activeTab, setActiveTab] = useState<PlatformType>("linkedin")
  const [urls, setUrls] = useState({
    linkedin: "",
    "google-business": "",
    facebook: "",
  })
  const [results, setResults] = useState<ScrapingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<{
    facebook?: boolean
    linkedin?: boolean
  }>({})
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const { toast } = useToast()

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/connect/status')
      if (response.ok) {
        const data = await response.json()
        setConnectedAccounts(data)
      }
    } catch (error) {
      console.log('Could not check connection status')
    }
  }

  const handleConnect = async (platform: 'facebook' | 'linkedin') => {
    setIsConnecting(platform)
    try {
      const response = await fetch('/api/connect/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })
      
      if (!response.ok) throw new Error('Failed to start connection')
      
      const { connectUrl, sessionId } = await response.json()
      
      // Open login window
      const loginWindow = window.open(
        connectUrl,
        'login',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )
      
      if (!loginWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }
      
      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'connect_success') {
          setConnectedAccounts(prev => ({ ...prev, [platform]: true }))
          setIsConnecting(null)
          toast({
            title: "Connected Successfully",
            description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected!`,
          })
          window.removeEventListener('message', messageHandler)
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      // Poll for completion (fallback)
      const pollForCompletion = async () => {
        try {
          const statusResponse = await fetch(`/api/connect/status?sessionId=${sessionId}`)
          if (statusResponse.ok) {
            const status = await statusResponse.json()
            if (status.connected) {
              loginWindow.close()
              setConnectedAccounts(prev => ({ ...prev, [platform]: true }))
              setIsConnecting(null)
              toast({
                title: "Connected Successfully",
                description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected!`,
              })
              window.removeEventListener('message', messageHandler)
              return
            }
          }
        } catch (error) {
          console.log('Polling error:', error)
        }
        
        // Continue polling if window is still open
        if (!loginWindow.closed) {
          setTimeout(pollForCompletion, 3000)
        } else {
          setIsConnecting(null)
          window.removeEventListener('message', messageHandler)
        }
      }
      
      setTimeout(pollForCompletion, 3000)
      
    } catch (error) {
      setIsConnecting(null)
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect account",
      })
    }
  }

  const handleExportSingle = async (result: ScrapingResult) => {
    if (!result.data) return

    setIsExporting(true)
    try {
      await ExcelExportService.exportSingleResult(result.platform, result.url, result.data)
      toast({
        title: "Export Successful",
        description: "Data has been exported to Excel successfully.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = async () => {
    const successfulResults = results.filter((result) => result.status === "success" && result.data)

    if (successfulResults.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please scrape some data first before exporting.",
      })
      return
    }

    setIsExporting(true)
    try {
      await ExcelExportService.exportMultipleResults(
        successfulResults.map((result) => ({
          platform: result.platform,
          url: result.url,
          data: result.data,
        })),
      )
      toast({
        title: "Export Successful",
        description: `Exported ${successfulResults.length} results to Excel successfully.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data to Excel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const platforms = [
    {
      id: "linkedin" as PlatformType,
      name: "LinkedIn",
      icon: Icons.Linkedin,
      color: "text-blue-600",
      placeholder: "https://www.linkedin.com/in/username or https://www.linkedin.com/company/company-name",
      description: "Extract profile data, work history, and contact information",
    },
    {
      id: "google-business" as PlatformType,
      name: "Google Business",
      icon: Icons.Building,
      color: "text-green-600",
      placeholder: "https://www.google.com/maps/place/business-name or Google My Business URL",
      description: "Gather business info, reviews, and location data",
    },
    {
      id: "facebook" as PlatformType,
      name: "Facebook",
      icon: Icons.Facebook,
      color: "text-blue-500",
      placeholder: "https://www.facebook.com/page-name or https://www.facebook.com/profile",
      description: "Collect page information and business details",
    },
  ]

  const handleUrlChange = (platform: PlatformType, value: string) => {
    setUrls((prev) => ({ ...prev, [platform]: value }))
  }

  const validateUrl = (platform: PlatformType, url: string): boolean => {
    if (!url.trim()) return false

    switch (platform) {
      case "linkedin":
        return url.includes("linkedin.com")
      case "google-business":
        return (
          url.includes("google.com/maps") ||
          url.includes("business.google.com") ||
          url.includes("share.google") ||
          url.includes("google.com/search") ||
          url.includes("maps.app.goo.gl") ||
          url.includes("goo.gl/maps") ||
          url.includes("maps.google.com")
        )
      case "facebook":
        return url.includes("facebook.com")
      default:
        return false
    }
  }

  const handleScrape = async (platform: PlatformType) => {
    const url = urls[platform]
    if (!validateUrl(platform, url)) {
      setResults((prev) => [
        ...prev.filter((r) => r.platform !== platform),
        {
          platform,
          url,
          status: "error",
          error: "Invalid URL format for this platform",
        },
      ])
      return
    }

    setIsLoading(true)
    setResults((prev) => [
      ...prev.filter((r) => r.platform !== platform),
      {
        platform,
        url,
        status: "scraping",
      },
    ])

    try {
      const result = await ScrapingService.scrapeUrl(platform, url)

      if (result.success) {
        setResults((prev) => [
          ...prev.filter((r) => r.platform !== platform),
          {
            platform,
            url,
            status: "success",
            data: result.data,
          },
        ])
        toast({
          title: "Scraping Successful",
          description: `Successfully extracted data from ${platform}.`,
        })
      } else {
        setResults((prev) => [
          ...prev.filter((r) => r.platform !== platform),
          {
            platform,
            url,
            status: "error",
            error: result.error || "Failed to scrape data",
          },
        ])
              toast({
        title: "Scraping Failed",
        description: result.error || "Failed to scrape data",
      })
      }
    } catch (error) {
      setResults((prev) => [
        ...prev.filter((r) => r.platform !== platform),
        {
          platform,
          url,
          status: "error",
          error: "Failed to scrape data. Please check the URL and try again.",
        },
      ])
      toast({
        title: "Scraping Failed",
        description: "Failed to scrape data. Please check the URL and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: ScrapingStatus) => {
    switch (status) {
      case "scraping":
        return <Icons.Loader className="h-4 w-4 animate-spin text-primary" />
      case "success":
        return <Icons.Check className="h-4 w-4 text-green-600" />
      case "error":
        return <Icons.X className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: ScrapingStatus) => {
    switch (status) {
      case "scraping":
        return <Badge>Scraping...</Badge>
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
      default:
        return null
    }
  }

  const renderLinkedInData = (data: any) => {
    if (data.companyUrl) {
      // Company data
      return (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-foreground">Company:</span>
              <p className="text-muted-foreground">{data.name}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Industry:</span>
              <p className="text-muted-foreground">{data.industry}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Size:</span>
              <p className="text-muted-foreground">{data.size}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Location:</span>
              <p className="text-muted-foreground">{data.location}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Website:</span>
              <p className="text-muted-foreground">{data.website}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Followers:</span>
              <p className="text-muted-foreground">{data.followers}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-foreground">About:</span>
            <p className="text-muted-foreground mt-1">{data.about}</p>
          </div>
        </div>
      )
    } else {
      // Profile data
      return (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-foreground">Name:</span>
              <p className="text-muted-foreground">{data.name}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Headline:</span>
              <p className="text-muted-foreground">{data.headline}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Location:</span>
              <p className="text-muted-foreground">{data.location}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Connections:</span>
              <p className="text-muted-foreground">{data.connections || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Followers:</span>
              <p className="text-muted-foreground">{data.followers || 'N/A'}</p>
            </div>
          </div>

          {data.experience && data.experience.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Experience:</span>
              <div className="mt-2 space-y-2">
                {data.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="bg-muted/50 p-2 rounded">
                    <p className="font-medium">
                      {exp.title} {exp.company ? `at ${exp.company}` : ""}
                    </p>
                    {exp.duration && <p className="text-xs text-muted-foreground">{exp.duration}</p>}
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Education:</span>
              <div className="mt-2 space-y-2">
                {data.education.map((edu: any, idx: number) => (
                  <div key={idx} className="bg-muted/50 p-2 rounded">
                    <p className="font-medium">{edu.school}</p>
                    <p className="text-xs text-muted-foreground">
                      {[edu.degree, edu.field, edu.years].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.languages && data.languages.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.languages.map((lang: string, idx: number) => (
                  <Badge key={idx} className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.recommendations && data.recommendations.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Recommendations:</span>
              <div className="mt-2 space-y-2">
                {data.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-muted/50 p-2 rounded">
                    <p className="text-sm font-medium">{rec.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <span className="font-medium text-foreground">Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.skills.slice(0, 5).map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {data.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{data.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  const renderGoogleBusinessData = (data: any) => {
    return (
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-foreground">Business Name:</span>
            <p className="text-muted-foreground">{data.name}</p>
          </div>
          <div>
            <span className="font-medium text-foreground">Category:</span>
            <p className="text-muted-foreground">{data.category}</p>
          </div>
          <div className="flex items-start gap-2">
            <Icons.MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Address:</span>
              <p className="text-muted-foreground">{data.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium text-foreground">Phone:</span>
              <p className="text-muted-foreground">{data.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-medium text-foreground">Website:</span>
              <p className="text-muted-foreground truncate">{data.website}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icons.Star className="h-4 w-4 text-yellow-500" />
            <div>
              <span className="font-medium text-foreground">Rating:</span>
              <p className="text-muted-foreground">
                {data.rating} ({data.reviewCount})
              </p>
            </div>
          </div>
        </div>

        {data.hours && data.hours.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icons.Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Hours:</span>
            </div>
            <div className="bg-muted/50 p-3 rounded space-y-1">
              {data.hours.slice(0, 3).map((hour: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span>{hour.day}</span>
                  <span>{hour.hours}</span>
                </div>
              ))}
              {data.hours.length > 3 && (
                <p className="text-xs text-muted-foreground">+{data.hours.length - 3} more days</p>
              )}
            </div>
          </div>
        )}

        {data.reviews && data.reviews.length > 0 && (
          <div>
            <span className="font-medium text-foreground">Recent Reviews:</span>
            <div className="mt-2 space-y-2">
              {data.reviews.slice(0, 2).map((review: any, idx: number) => (
                <div key={idx} className="bg-muted/50 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs">{review.author}</span>
                    <span className="text-xs text-muted-foreground">{review.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.amenities && data.amenities.length > 0 && (
          <div>
            <span className="font-medium text-foreground">Amenities:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.amenities.slice(0, 6).map((amenity: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {data.amenities.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{data.amenities.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderFacebookData = (data: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Name</label>
          <p className="text-lg font-semibold">{data.name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Category</label>
          <p className="text-lg">{data.category || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Phone</label>
          <p className="text-lg">{data.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg">{data.email || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Website</label>
          <p className="text-lg">{data.website || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Likes</label>
          <p className="text-lg">{data.likes || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Followers</label>
          <p className="text-lg">{data.followers || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Rating</label>
          <p className="text-lg">{data.rating || 'N/A'}</p>
        </div>
      </div>
      
      {data.description && (
        <div>
          <label className="text-sm font-medium text-gray-600">Description</label>
          <p className="text-sm text-gray-700 mt-1">{data.description}</p>
        </div>
      )}
    </div>
  )

  const successfulResults = results.filter((result) => result.status === "success" && result.data)

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">Start Scraping Data</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Paste any LinkedIn, Google Business, or Facebook URL to extract valuable data
            </p>
          </div>

          {successfulResults.length > 0 && (
            <div className="mb-6 flex justify-center">
              <Button
                onClick={handleExportAll}
                disabled={isExporting}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {isExporting ? (
                  <Icons.Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Icons.Download className="h-4 w-4 mr-2" />
                )}
                Export All Results to Excel ({successfulResults.length})
              </Button>
            </div>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Search className="h-5 w-5 text-primary" />
                Data Extraction Tool
              </CardTitle>
              <CardDescription>Choose a platform and enter the URL you want to scrape data from</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PlatformType)}>
                <TabsList className="grid w-full grid-cols-3">
                  {platforms.map((platform) => (
                    <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
                      {platform.icon ? <platform.icon className="h-4 w-4" /> : null} {platform.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {platforms.map((platform) => (
                  <TabsContent key={platform.id} value={platform.id} className="space-y-4">
                    {platform.id === "linkedin" && <LinkedInBookmarklet />}
                    <div className="space-y-2">
                      <Label htmlFor={`${platform.id}-url`} className="text-sm font-medium">
                        {platform.name} URL
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id={`${platform.id}-url`}
                          placeholder={platform.placeholder}
                          value={urls[platform.id]}
                          onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleScrape(platform.id)}
                          disabled={isLoading || !urls[platform.id].trim()}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {isLoading ? (
                            <Icons.Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Icons.Search className="h-4 w-4" />
                          )}
                          Scrape
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{platform.description}</p>
                      
                      {/* Connect button for Facebook/LinkedIn */}
                      {(platform.id === 'facebook' || platform.id === 'linkedin') && (
                        <div className="mt-3">
                          {connectedAccounts[platform.id] ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <Icons.Check className="h-4 w-4" />
                              Connected
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConnect(platform.id)}
                              disabled={isConnecting === platform.id}
                              className="w-full"
                            >
                              {isConnecting === platform.id ? (
                                <>
                                  <Icons.Loader className="h-4 w-4 animate-spin mr-2" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <Icons.Link className="h-4 w-4 mr-2" />
                                  Connect {platform.name}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Results for this platform */}
                    {results
                      .filter((result) => result.platform === platform.id)
                      .map((result, index) => (
                        <Card key={index} className="bg-muted/30 border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {getStatusIcon(result.status)}
                                <span className="text-sm font-medium truncate max-w-[calc(100vw-8rem)] sm:max-w-md">{result.url}</span>
                              </div>
                              {getStatusBadge(result.status)}
                            </div>

                            {result.status === "success" && result.data && (
                              <div className="space-y-4">
                                {platform.id === "linkedin" && renderLinkedInData(result.data)}
                                {platform.id === "google-business" && renderGoogleBusinessData(result.data)}
                                {platform.id === "facebook" && renderFacebookData(result.data)}

                                <div className="pt-2 flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleExportSingle(result)}
                                    disabled={isExporting}
                                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                  >
                                    {isExporting ? (
                                      <Icons.Loader className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <Icons.Download className="h-4 w-4 mr-2" />
                                    )}
                                    Export to Excel
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline">View Full Data</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl">
                                      <DialogHeader>
                                        <DialogTitle>Full Result</DialogTitle>
                                      </DialogHeader>
                                      <pre className="max-h-[70vh] overflow-auto rounded bg-muted/50 p-4 text-xs">
{JSON.stringify(result.data, null, 2)}
                                      </pre>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            )}

                            {result.status === "error" && result.error && (
                              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{result.error}</div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
