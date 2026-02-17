"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Unlock, 
  Heart, 
  Briefcase, 
  Brain, 
  Sparkles,
  Shield,
  Star,
  Eye,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { DISCLAIMER } from "@/lib/constants";

interface ReadingSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: any;
  isLocked: boolean;
  alwaysVisible?: boolean;
}

interface ReadingResultDisplayProps {
  analysis: any;
  profileName: string;
  imageUrl?: string;
  lockedSections?: string[];
  createdAt: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function ReadingResultDisplay({ 
  analysis, 
  profileName, 
  imageUrl, 
  lockedSections = [],
  createdAt 
}: ReadingResultDisplayProps) {
  const [userAccessTier, setUserAccessTier] = useState<string>("trial");

  useEffect(() => {
    // Load user access tier
    fetch("/api/user/access")
      .then(res => res.json())
      .then(data => {
        setUserAccessTier(data.tier || data.accessTier || "trial");
      })
      .catch(console.error);
  }, []);

  const sections: ReadingSection[] = [
    {
      id: "personality",
      title: "Personality Insights",
      icon: Brain,
      content: analysis.personality,
      isLocked: false,
      alwaysVisible: true
    },
    {
      id: "life_path",
      title: "Life Path",
      icon: Sparkles,
      content: analysis.life_path,
      isLocked: false,
      alwaysVisible: true
    },
    {
      id: "career",
      title: "Career & Success",
      icon: Briefcase,
      content: analysis.career,
      isLocked: false,
      alwaysVisible: true
    },
    {
      id: "relationships",
      title: "Love & Relationships",
      icon: Heart,
      content: analysis.relationships,
      isLocked: lockedSections.includes("relationships")
    },
    {
      id: "health",
      title: "Health & Vitality",
      icon: Shield,
      content: analysis.health,
      isLocked: lockedSections.includes("health")
    },
    {
      id: "lucky",
      title: "Lucky Numbers & Colors",
      icon: Star,
      content: analysis.lucky,
      isLocked: lockedSections.includes("lucky")
    }
  ];

  const LockedOverlay = ({ section }: { section: ReadingSection }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
    >
      <div className="text-center p-6">
        <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-semibold mb-2">Unlock with Pro</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get access to {section.title.toLowerCase()} insights and more
        </p>
        <Link href="/pricing">
          <Button size="sm" className="gap-2">
            <Unlock className="h-4 w-4" />
            Upgrade Now
          </Button>
        </Link>
      </div>
    </motion.div>
  );

  const SectionCard = ({ section, index }: { section: ReadingSection; index: number }) => (
    <motion.div
      key={section.id}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.2 }}
      className="relative"
    >
      <Card className="border-border/40 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            {section.title}
            {section.alwaysVisible && (
              <Badge variant="secondary" className="text-xs">
                Always Available
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className={section.isLocked ? "blur-sm" : ""}>
          {section.content && (
            <div className="space-y-4">
              {section.content.summary && (
                <p className="text-lg leading-relaxed">{section.content.summary}</p>
              )}
              
              {section.content.traits && (
                <div>
                  <h4 className="font-semibold mb-2">Key Traits:</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.content.traits.map((trait: string, i: number) => (
                      <Badge key={i} variant="outline">{trait}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {section.content.details && (
                <div>
                  <h4 className="font-semibold mb-2">Details:</h4>
                  <p className="text-muted-foreground">{section.content.details}</p>
                </div>
              )}

              {section.content.advice && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Guidance:
                  </h4>
                  <p className="text-sm">{section.content.advice}</p>
                </div>
              )}

              {section.content.numbers && (
                <div>
                  <h4 className="font-semibold mb-2">Your Numbers:</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.content.numbers.map((number: number, i: number) => (
                      <Badge key={i} variant="default" className="text-lg px-3 py-1">
                        {number}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {section.content.colors && (
                <div>
                  <h4 className="font-semibold mb-2">Lucky Colors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.content.colors.map((color: string, i: number) => (
                      <Badge key={i} variant="outline">{color}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        {section.isLocked && <LockedOverlay section={section} />}
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Living palm header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge variant="outline" className="mb-4">
          Living Palm Reading
        </Badge>
        <p className="text-sm text-muted-foreground">
          This reading captured {new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </motion.div>

      {/* Palm image */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative max-w-md">
            <img
              src={imageUrl}
              alt={`Palm reading for ${profileName}`}
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>
        </motion.div>
      )}

      {/* Reading sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {sections.map((section, index) => (
          <SectionCard key={section.id} section={section} index={index} />
        ))}
      </motion.div>

      {/* Upgrade CTA for locked sections */}
      {lockedSections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sections.length * 0.2 + 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Unlock Your Complete Reading
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                You're seeing {sections.filter(s => !s.isLocked).length} of {sections.length} sections. 
                Upgrade to Pro to unlock detailed insights about your relationships, health, 
                lucky numbers, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing">
                  <Button size="lg" className="gap-2">
                    <Unlock className="h-5 w-5" />
                    Upgrade to Pro
                  </Button>
                </Link>
                <Link href="/dashboard/readings/new">
                  <Button variant="outline" size="lg" className="gap-2">
                    New Reading
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: sections.length * 0.2 + 0.5 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          {DISCLAIMER}
        </p>
      </motion.div>
    </div>
  );
}
