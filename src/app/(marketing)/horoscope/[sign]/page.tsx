import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Star, 
  Calendar, 
  Heart, 
  TrendingUp, 
  Palette,
  Clock,
  Hand
} from "lucide-react";
import { getDailyHoroscope } from "@/lib/horoscope";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const SIGN_INFO = {
  aries: { name: "Aries", dates: "Mar 21 - Apr 19", element: "Fire", symbol: "♈" },
  taurus: { name: "Taurus", dates: "Apr 20 - May 20", element: "Earth", symbol: "♉" },
  gemini: { name: "Gemini", dates: "May 21 - Jun 20", element: "Air", symbol: "♊" },
  cancer: { name: "Cancer", dates: "Jun 21 - Jul 22", element: "Water", symbol: "♋" },
  leo: { name: "Leo", dates: "Jul 23 - Aug 22", element: "Fire", symbol: "♌" },
  virgo: { name: "Virgo", dates: "Aug 23 - Sep 22", element: "Earth", symbol: "♍" },
  libra: { name: "Libra", dates: "Sep 23 - Oct 22", element: "Air", symbol: "♎" },
  scorpio: { name: "Scorpio", dates: "Oct 23 - Nov 21", element: "Water", symbol: "♏" },
  sagittarius: { name: "Sagittarius", dates: "Nov 22 - Dec 21", element: "Fire", symbol: "♐" },
  capricorn: { name: "Capricorn", dates: "Dec 22 - Jan 19", element: "Earth", symbol: "♑" },
  aquarius: { name: "Aquarius", dates: "Jan 20 - Feb 18", element: "Air", symbol: "♒" },
  pisces: { name: "Pisces", dates: "Feb 19 - Mar 20", element: "Water", symbol: "♓" }
};

interface PageProps {
  params: { sign: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!params?.sign) {
    return {
      title: "Horoscope Not Found",
    };
  }
  
  const sign = params.sign.toLowerCase();
  
  if (!ZODIAC_SIGNS.includes(sign)) {
    return {
      title: "Horoscope Not Found",
    };
  }

  const signInfo = SIGN_INFO[sign as keyof typeof SIGN_INFO];
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return {
    title: `${signInfo.name} Horoscope Today - ${today} | Palmtell`,
    description: `Today's ${signInfo.name} horoscope (${signInfo.dates}). Get your daily astrology reading with lucky numbers, colors, and personalized insights. Free horoscope for ${signInfo.name}.`,
    keywords: `${sign} horoscope, ${sign} horoscope today, ${signInfo.name} daily horoscope, ${sign} astrology, horoscope ${new Date().getFullYear()}`,
    openGraph: {
      title: `${signInfo.name} Horoscope Today - ${today}`,
      description: `Today's ${signInfo.name} horoscope with lucky numbers, colors, and personalized insights.`,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({
    sign: sign,
  }));
}

export default async function HoroscopePage({ params }: PageProps) {
  if (!params?.sign) {
    notFound();
  }
  
  const sign = params.sign.toLowerCase();
  
  if (!ZODIAC_SIGNS.includes(sign)) {
    notFound();
  }

  const signInfo = SIGN_INFO[sign as keyof typeof SIGN_INFO];
  let horoscope = null;
  let error = null;

  try {
    horoscope = await getDailyHoroscope(sign);
  } catch (err) {
    error = "Unable to load horoscope at this time";
    console.error("Horoscope fetch error:", err);
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{signInfo.symbol}</span>
            <Badge variant="outline">
              {signInfo.element} Sign
            </Badge>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">
            {signInfo.name} Horoscope
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {signInfo.dates}
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            {today}
          </p>
        </div>
      </section>

      {/* Horoscope Content */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {error ? (
            <Card className="border-destructive/50">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Horoscope Temporarily Unavailable</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later or get a personalized palm reading instead.
                </p>
              </CardContent>
            </Card>
          ) : horoscope ? (
            <div className="space-y-8">
              {/* Main Horoscope */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-primary" />
                    Today's Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{horoscope.description}</p>
                </CardContent>
              </Card>

              {/* Daily Insights Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <h3 className="font-semibold mb-1">Compatibility</h3>
                    <p className="text-sm text-muted-foreground">{horoscope.compatibility}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold mb-1">Mood</h3>
                    <p className="text-sm text-muted-foreground">{horoscope.mood}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Palette className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold mb-1">Lucky Color</h3>
                    <p className="text-sm text-muted-foreground">{horoscope.color}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold mb-1">Lucky Time</h3>
                    <p className="text-sm text-muted-foreground">{horoscope.luckyTime}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lucky Number Highlight */}
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-8 text-center">
                  <Star className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Lucky Number</h3>
                  <p className="text-4xl font-bold text-primary mb-2">{horoscope.luckyNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Keep this number in mind throughout your day
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your horoscope...</p>
            </div>
          )}
        </div>
      </section>

      {/* Other Signs */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            Other Zodiac Signs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ZODIAC_SIGNS.filter(s => s !== sign).map((otherSign) => {
              const info = SIGN_INFO[otherSign as keyof typeof SIGN_INFO];
              return (
                <Link key={otherSign} href={`/horoscope/${otherSign}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{info.symbol}</div>
                      <h3 className="font-semibold text-sm">{info.name}</h3>
                      <p className="text-xs text-muted-foreground">{info.dates}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">
            Want More Personal Insights?
          </h2>
          <p className="text-muted-foreground mb-8">
            While horoscopes provide general guidance, palm reading offers deeply personal 
            insights based on your unique palm lines and characteristics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/free-reading">
              <Button size="lg" className="gap-2">
                <Hand className="h-5 w-5" />
                Get Personal Palm Reading
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                View Monthly Horoscope
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Free palm reading • Personalized insights • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
