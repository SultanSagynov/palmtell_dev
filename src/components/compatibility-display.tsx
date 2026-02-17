"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import { 
  Heart, 
  MessageCircle, 
  Target, 
  Home,
  Crown,
  Loader2,
  Users
} from "lucide-react";

interface CompatibilityReading {
  profileA: {
    name: string;
    sign?: string;
    emoji?: string;
  };
  profileB: {
    name: string;
    sign?: string;
    emoji?: string;
  };
  overallScore: number;
  summary: string;
  categories: {
    communication: { score: number; description: string };
    emotional: { score: number; description: string };
    intellectual: { score: number; description: string };
    physical: { score: number; description: string };
    lifestyle?: { score: number; description: string };
    goals?: { score: number; description: string };
    strengths: string[];
    challenges: string[];
  };
  strengths?: string[];
  challenges?: string[];
  advice?: string;
  zodiacCompatibility?: {
    signA: string;
    signB: string;
    description: string;
  };
}

interface Profile {
  id: string;
  name: string;
  dob: string | null;
  avatarEmoji?: string;
  isDefault: boolean;
}

interface CompatibilityDisplayProps {
  profiles: Profile[];
}

export function CompatibilityDisplay({ profiles }: CompatibilityDisplayProps) {
  const { user } = useUser();
  const [selectedProfileA, setSelectedProfileA] = useState<string>("");
  const [selectedProfileB, setSelectedProfileB] = useState<string>("");
  const [compatibility, setCompatibility] = useState<CompatibilityReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCompatibility = async () => {
    if (!selectedProfileA || !selectedProfileB) {
      setError("Please select two profiles for compatibility analysis");
      return;
    }

    if (selectedProfileA === selectedProfileB) {
      setError("Please select two different profiles");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/readings/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileAId: selectedProfileA,
          profileBId: selectedProfileB,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate compatibility reading");
      }

      setCompatibility(data.compatibility);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate compatibility reading";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (profiles.length < 2) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Not Enough Profiles</h3>
          <p className="text-sm text-muted-foreground text-center">
            You need at least 2 profiles with completed palm readings to generate compatibility analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Compatibility Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Profile</label>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfileA(profile.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedProfileA === profile.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {profile.avatarEmoji && (
                        <span className="text-lg">{profile.avatarEmoji}</span>
                      )}
                      <span className="font-medium">{profile.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Second Profile</label>
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfileB(profile.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedProfileB === profile.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {profile.avatarEmoji && (
                        <span className="text-lg">{profile.avatarEmoji}</span>
                      )}
                      <span className="font-medium">{profile.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={generateCompatibility}
            disabled={!selectedProfileA || !selectedProfileB || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Compatibility...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Generate Compatibility Reading
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compatibility Results */}
      {compatibility && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Compatibility Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    {compatibility.profileA.emoji && (
                      <span className="text-2xl">{compatibility.profileA.emoji}</span>
                    )}
                    <p className="font-medium">{compatibility.profileA.name}</p>
                    {compatibility.profileA.sign && (
                      <Badge variant="outline" className="text-xs mt-1">{compatibility.profileA.sign}</Badge>
                    )}
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                  <div className="text-center">
                    {compatibility.profileB.emoji && (
                      <span className="text-2xl">{compatibility.profileB.emoji}</span>
                    )}
                    <p className="font-medium">{compatibility.profileB.name}</p>
                    {compatibility.profileB.sign && (
                      <Badge variant="outline" className="text-xs mt-1">{compatibility.profileB.sign}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`text-4xl font-bold ${getScoreColor(compatibility.overallScore)}`}>
                    {compatibility.overallScore}%
                  </div>
                  <Badge variant={getScoreBadgeVariant(compatibility.overallScore)} className="text-sm">
                    {compatibility.overallScore >= 80 ? "Excellent Match" : 
                     compatibility.overallScore >= 60 ? "Good Match" : "Challenging Match"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {compatibility.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Challenges */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-green-600">Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compatibility.strengths?.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-yellow-600">Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {compatibility.challenges?.map((challenge: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shrink-0" />
                      <p className="text-sm">{challenge}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advice */}
          {compatibility.advice && (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Relationship Advice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{compatibility.advice}</p>
              </CardContent>
            </Card>
          )}

          {/* Zodiac Compatibility */}
          {compatibility.zodiacCompatibility && (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Zodiac Compatibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="outline">
                    {compatibility.zodiacCompatibility.signA.charAt(0).toUpperCase() + 
                     compatibility.zodiacCompatibility.signA.slice(1)}
                  </Badge>
                  <Heart className="h-4 w-4 text-red-500" />
                  <Badge variant="outline">
                    {compatibility.zodiacCompatibility.signB.charAt(0).toUpperCase() + 
                     compatibility.zodiacCompatibility.signB.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{compatibility.zodiacCompatibility.description}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
