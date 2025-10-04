"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/lib/icons"

const mockResults = [
  {
    id: 1,
    type: "linkedin",
    url: "https://linkedin.com/in/johndoe",
    name: "John Doe",
    title: "Senior Software Engineer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    connections: 500,
    scrapedAt: "2024-01-15T10:30:00Z",
    status: "success",
  },
  {
    id: 2,
    type: "google-business",
    url: "https://maps.google.com/business/123",
    name: "The Modern Bistro",
    category: "Restaurant",
    rating: 4.5,
    reviews: 234,
    location: "New York, NY",
    phone: "+1 (555) 123-4567",
    scrapedAt: "2024-01-15T11:15:00Z",
    status: "success",
  },
  {
    id: 3,
    type: "facebook",
    url: "https://facebook.com/techstartup",
    name: "Tech Startup Inc",
    type_fb: "Business Page",
    followers: 12500,
    likes: 11200,
    location: "Austin, TX",
    scrapedAt: "2024-01-15T12:00:00Z",
    status: "success",
  },
]

const analytics = {
  totalScrapes: 156,
  successRate: 94,
  linkedinScrapes: 67,
  googleBusinessScrapes: 45,
  facebookScrapes: 44,
  thisWeek: 23,
  thisMonth: 89,
}

export function ResultsDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredResults = mockResults.filter(
    (result) =>
      result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "linkedin":
        return <Icons.Linkedin className="h-4 w-4 text-blue-600" />
      case "google-business":
        return <Icons.Building className="h-4 w-4 text-green-600" />
      case "facebook":
        return <Icons.Facebook className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "linkedin":
        return "bg-blue-100 text-blue-800"
      case "google-business":
        return "bg-green-100 text-green-800"
      case "facebook":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Results Dashboard</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor your scraping activities, analyze data trends, and manage your extracted profiles
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Icons.BarChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Icons.Eye className="h-4 w-4" />
              All Results
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Icons.TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scrapes</CardTitle>
                  <Icons.Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalScrapes}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.thisWeek} this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Icons.TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.successRate}%</div>
                  <Progress value={analytics.successRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Icons.Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.thisMonth}</div>
                  <p className="text-xs text-muted-foreground">Across all platforms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Split</CardTitle>
                  <Icons.BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Icons.Linkedin className="h-3 w-3" />
                        LinkedIn
                      </span>
                      <span>{analytics.linkedinScrapes}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Icons.Building className="h-3 w-3" />
                        Google
                      </span>
                      <span>{analytics.googleBusinessScrapes}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Icons.Facebook className="h-3 w-3" />
                        Facebook
                      </span>
                      <span>{analytics.facebookScrapes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scrapes</CardTitle>
                <CardDescription>Your latest data extraction results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getTypeIcon(result.type)}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.type === "linkedin" && result.title}
                            {result.type === "google-business" && result.category}
                            {result.type === "facebook" && result.type_fb}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                        <Button size="sm" variant="outline">
                          <Icons.Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>All Scraped Results</CardTitle>
                <CardDescription>Manage and export your extracted data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or URL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button variant="outline">
                    <Icons.Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button>
                    <Icons.Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {getTypeIcon(result.type)}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{result.name}</h3>
                                <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                              </div>

                              {result.type === "linkedin" && (
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>
                                    {result.title} at {result.company}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Icons.MapPin className="h-3 w-3" />
                                      {result.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Icons.Users className="h-3 w-3" />
                                      {result.connections} connections
                                    </span>
                                  </div>
                                </div>
                              )}

                              {result.type === "google-business" && (
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>{result.category}</p>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Icons.MapPin className="h-3 w-3" />
                                      {result.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Icons.Star className="h-3 w-3" />
                                      {result.rating} ({result.reviews} reviews)
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Icons.Phone className="h-3 w-3" />
                                      {result.phone}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {result.type === "facebook" && (
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>{result.type_fb}</p>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Icons.MapPin className="h-3 w-3" />
                                      {result.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Icons.Users className="h-3 w-3" />
                                      {result.followers} followers
                                    </span>
                                  </div>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Icons.Clock className="h-3 w-3" />
                                Scraped {new Date(result.scrapedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Icons.Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Icons.Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Icons.Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                  <CardDescription>Success rates by platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Icons.Linkedin className="h-4 w-4" />
                          LinkedIn
                        </span>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                      <Progress value={96} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Icons.Building className="h-4 w-4" />
                          Google Business
                        </span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm">
                          <Icons.Facebook className="h-4 w-4" />
                          Facebook
                        </span>
                        <span className="text-sm font-medium">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>Scraping activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">23</div>
                        <div className="text-sm text-muted-foreground">This Week</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">89</div>
                        <div className="text-sm text-muted-foreground">This Month</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold text-accent">156</div>
                      <div className="text-sm text-muted-foreground">Total Scrapes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
