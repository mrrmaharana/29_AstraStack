"use client"

import React, { useState } from "react"
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Smile, 
  Meh, 
  Frown 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TextAnalyzerProps {
  onBack: () => void
}

interface AnalysisResult {
  entities: {
    PERSON: string[]
    ORG: string[]
    GPE: string[]
    LOC: string[]
    DATE: string[]
    MONEY: string[]
  }
  emails: string[]
  phones: string[]
  urls: string[]
  socials: string[]
  sentiment: {
    polarity: number
    subjectivity: number
    label: string
  }
  risks: string[]
  risk_score: number
  web_results: {
    title: string
    href: string
    body: string
  }[]
}

export default function TextAnalyzer({ onBack }: TextAnalyzerProps) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setResult(data.data)
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText("")
    setResult(null)
    setError(null)
  }

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'Positive': return <Smile className="h-6 w-6 text-green-500" />
      case 'Negative': return <Frown className="h-6 w-6 text-red-500" />
      default: return <Meh className="h-6 w-6 text-yellow-500" />
    }
  }

  const getRiskColor = (score: number) => {
    if (score > 70) return "bg-red-500"
    if (score > 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Text Intelligence Analyzer</h2>
          <p className="text-muted-foreground">Extract entities, detect risks, and analyze sentiment from text.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Text</CardTitle>
          <CardDescription>
            Paste profile bios, posts, or document text below for analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter text to analyze..."
            className="min-h-[200px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {text.length} characters
            </span>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleClear} disabled={!text}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button onClick={handleAnalyze} disabled={!text || loading}>
                {loading ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Risk Assessment */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <Badge variant={result.risk_score > 50 ? "destructive" : "secondary"}>
                  Risk Score: {result.risk_score}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Privacy Exposure Level</span>
                  <span>{result.risk_score}%</span>
                </div>
                <Progress value={result.risk_score} className={getRiskColor(result.risk_score)} />
              </div>
              
              {result.risks.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Detected Risks:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                    {result.risks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  No significant privacy risks detected.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSentimentIcon(result.sentiment.label)}
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Tone</span>
                <Badge variant={result.sentiment.label === 'Negative' ? 'destructive' : 'default'}>
                  {result.sentiment.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Polarity</span>
                  <span className="font-medium">{result.sentiment.polarity.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Subjectivity</span>
                  <span className="font-medium">{result.sentiment.subjectivity.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Key Entities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.entities.PERSON.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">People</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.PERSON.map((p, i) => (
                      <Badge key={i} variant="outline">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.entities.ORG.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Organizations</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.ORG.map((o, i) => (
                      <Badge key={i} variant="outline">{o}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(result.entities.GPE.length > 0 || result.entities.LOC.length > 0) && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...result.entities.GPE, ...result.entities.LOC].map((l, i) => (
                      <Badge key={i} variant="outline"><MapPin className="h-3 w-3 mr-1 inline" />{l}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {Object.values(result.entities).every(arr => arr.length === 0) && (
                <p className="text-sm text-muted-foreground">No named entities found.</p>
              )}
            </CardContent>
          </Card>

          {/* Web Intelligence */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Related Web Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.web_results && result.web_results.length > 0 ? (
                  result.web_results.map((item, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium text-base block mb-1">
                        {item.title}
                      </a>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                      <span className="text-xs text-slate-500 mt-1 block">{item.href}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No related web results found.</p>
                )}
              </div>
            </CardContent>
          </Card>


        </div>
      )}
    </div>
  )
}
