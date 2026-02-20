"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PalmAnalysis, READING_SECTIONS } from "@/types";
import { useUser } from "@clerk/nextjs";
import { 
  User, 
  Compass, 
  Briefcase, 
  Heart, 
  Activity, 
  Star, 
  Lock,
  Crown
} from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";
import Image from "next/image";

interface ReadingDisplayProps {
  analysis: PalmAnalysis;
  profileName: string;
  imageUrl?: string;
}

const SECTION_ICONS = {
  personality: User,
  life_path: Compass,
  career: Briefcase,
  relationships: Heart,
  health: Activity,
  lucky: Star,
};

interface AccessTier {
  tier: "basic" | "pro" | "ultimate";
}

export function ReadingDisplay({ analysis, profileName, imageUrl }: ReadingDisplayProps) {
  const { user } = useUser();
  const [accessTier, setAccessTier] = useState<AccessTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAccessTier() {
      try {
        const response = await fetch("/api/user/access");
        const data = await response.json();
        
        if (response.ok) {
          setAccessTier({ 
            tier: data.tier || "basic"
          });
        }
      } catch (error) {
        console.error("Failed to fetch access tier:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchAccessTier();
    }
  }, [user]);

  const getVisibleSections = () => {
    if (!accessTier) return [];
    
    if (accessTier.tier === "basic") {
      return ["personality", "life_path", "career"];
    } else if (accessTier.tier === "pro") {
      return ["personality", "life_path", "career", "relationships", "health"];
    } else if (accessTier.tier === "ultimate") {
      return ["personality", "life_path", "career", "relationships", "health", "lucky"];
    }
    
    return [];
  };

  const isSectionAccessible = (sectionKey: string) => {
    return getVisibleSections().includes(sectionKey);
  };

  const renderUpgradeOverlay = (sectionKey: string) => {
    const section = READING_SECTIONS.find(s => s.key === sectionKey);
    if (!section) return null;

    const requiredTier = section.proAccess ? "pro" : "ultimate";
    const tierName = requiredTier === "pro" ? "Pro" : "Ultimate";
    const price = requiredTier === "pro" ? "$9.99/mo" : "$19.99/mo";

    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h4 className="font-semibold mb-2">Upgrade to {tierName}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock this section and more for {price}
          </p>
          <Button size="sm" className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  };

  const renderSection = (sectionKey: string, title: string, content: any, index: number) => {
    const Icon = SECTION_ICONS[sectionKey as keyof typeof SECTION_ICONS];
    const isAccessible = isSectionAccessible(sectionKey);
    
    return (
      <motion.div
        key={sectionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Card className={`border-border/40 relative ${!isAccessible ? 'overflow-hidden' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
              {!isAccessible && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className={!isAccessible ? 'blur-sm' : ''}>
            {sectionKey === 'personality' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{content.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {content.traits.map((trait: string, i: number) => (
                    <Badge key={i} variant="secondary">{trait}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {sectionKey === 'life_path' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{content.summary}</p>
                <div className="grid gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Life Line</h5>
                    <p className="text-xs text-muted-foreground">{content.lines.life}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Head Line</h5>
                    <p className="text-xs text-muted-foreground">{content.lines.head}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Heart Line</h5>
                    <p className="text-xs text-muted-foreground">{content.lines.heart}</p>
                  </div>
                </div>
              </div>
            )}
            
            {sectionKey === 'career' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{content.summary}</p>
                <div>
                  <h5 className="font-medium text-sm mb-2">Recommended Fields</h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {content.fields.map((field: string, i: number) => (
                      <Badge key={i} variant="outline">{field}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Key Strengths</h5>
                  <div className="flex flex-wrap gap-2">
                    {content.strengths.map((strength: string, i: number) => (
                      <Badge key={i} variant="secondary">{strength}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {sectionKey === 'relationships' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{content.summary}</p>
              </div>
            )}
            
            {sectionKey === 'health' && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{content.summary}</p>
              </div>
            )}
            
            {sectionKey === 'lucky' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h5 className="font-medium mb-2">Your Lucky Numbers</h5>
                  <div className="flex justify-center gap-2 mb-3">
                    {content.numbers.map((num: number, i: number) => (
                      <div key={i} className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {num}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Lucky Symbol: <span className="font-medium">{content.symbol}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          {!isAccessible && renderUpgradeOverlay(sectionKey)}
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/40">
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imageUrl}
                    alt="Palm photo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Palm Analysis Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    AI analysis of {profileName}'s palm reading
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reading sections */}
      <div className="grid gap-6">
        {renderSection('personality', 'Personality', analysis.personality, 0)}
        {renderSection('life_path', 'Life Path', analysis.life_path, 1)}
        {renderSection('career', 'Career', analysis.career, 2)}
        {renderSection('relationships', 'Relationships', analysis.relationships, 3)}
        {renderSection('health', 'Health', analysis.health, 4)}
        {renderSection('lucky', 'Lucky Numbers', analysis.lucky, 5)}
      </div>

      {/* Upgrade prompt for basic users */}
      {accessTier?.tier === "basic" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Card className="border-accent/50 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Unlock more insights</p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Pro for relationships, health insights and more
                  </p>
                </div>
                <Button size="sm" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
      </motion.div>
    </div>
  );
}
