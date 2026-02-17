import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  ArrowLeft,
  Hand,
  Star,
  Heart,
  Brain
} from "lucide-react";
import { notFound } from "next/navigation";

const blogPosts: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    readTime: string;
    publishDate: string;
    author: string;
    featured: boolean;
    icon: typeof Hand;
  }
> = {
  "beginner-guide-palm-reading": {
    title: "Complete Beginner's Guide to Palm Reading",
    excerpt: "Learn the basics of palmistry with this comprehensive guide covering the major lines, mounts, and what they reveal about your personality.",
    content: `# Complete Beginner's Guide to Palm Reading

Palmistry, the ancient art of reading palms, has fascinated people for thousands of years. Whether you're curious about this mystical practice or looking to deepen your understanding, this beginner's guide will walk you through the fundamentals.

## The Major Lines

### The Life Line
The life line is one of the most recognizable features in palmistry. Despite popular belief, it doesn't determine how long you'll live. Instead, it represents the quality of life, physical vitality, and major life events.

### The Heart Line
Located above the life line, the heart line reveals emotions, relationships, and romantic inclinations. The length, curvature, and characteristics of this line tell stories about your emotional nature.

### The Head Line
The head line represents intellect, communication style, and mental clarity. It reveals how you think, learn, and process information.

### The Fate Line
The fate line indicates career path, life purpose, and destiny. Not everyone has a prominent fate line, and that's perfectly normal.

## The Mounts

The mounts are fleshy pads on your palm beneath each finger and at specific locations. Each mount corresponds to different planets and represents various traits:

- **Mount of Venus**: Love, passion, and sensuality
- **Mount of Jupiter**: Ambition, leadership, and confidence
- **Mount of Saturn**: Discipline, responsibility, and wisdom
- **Mount of Apollo**: Creativity, success, and charisma
- **Mount of Mercury**: Communication, intellect, and business acumen
- **Mount of the Moon**: Intuition, imagination, and emotional sensitivity

## Tips for Beginning Your Journey

1. **Study both hands** - The dominant hand shows your present and future, while the non-dominant reveals your past and innate characteristics
2. **Look for patterns** - Palmistry is about seeing the whole picture, not just individual lines
3. **Be patient** - Learning to read palms takes practice and observation
4. **Keep an open mind** - Palmistry is both an art and science

Start practicing on friends and family, and you'll develop your own intuition about what different palm features mean.`,
    category: "Palmistry Basics",
    readTime: "8 min read",
    publishDate: "2024-01-15",
    author: "Palmtell Team",
    featured: true,
    icon: Hand
  },
  "love-lines-relationship-palmistry": {
    title: "Love Lines: What Your Palm Says About Relationships",
    excerpt: "Discover how to read relationship patterns in your palm, including marriage lines, heart line variations, and compatibility indicators.",
    content: `# Love Lines: What Your Palm Says About Relationships

The palm holds many secrets about your romantic life. While no palm reading can predict the future, understanding the love-related features can provide insights into your relationship patterns and emotional nature.

## Reading the Heart Line

The heart line is the primary indicator of romantic nature. Here are key characteristics to notice:

### Heart Line Length
- **Long heart line** (extends across the palm): Expresses emotions openly, loyal partner
- **Short heart line**: More reserved, values independence
- **Curved heart line**: Romantic, emotional, expressive
- **Straight heart line**: Practical in love, thoughtful partner

### Heart Line Starting Point
- **Under Saturn**: Cautious in relationships, takes time to trust
- **Under Jupiter**: Idealistic romantic, seeks deep connection
- **In the middle**: Balanced approach to love and emotions

## The Marriage Line

Located between the heart line and the base of the pinky finger, marriage lines indicate significant relationships:

- **One clear line**: Long-lasting, important relationship
- **Multiple lines**: Various relationships and connections
- **Deep line**: Significant emotional impact
- **Shallow line**: Short-lived or less serious relationship

## Compatibility in Palms

When comparing two people's palms:
- **Similar line patterns** suggest compatibility
- **Complementary mounts** indicate balance
- **Heart line characteristics** reveal emotional match

## What the Mounts Tell Us About Love

- **Mount of Venus**: Represents passion and sensuality
- **Mount of the Moon**: Intuition and emotional understanding
- **Mount of Jupiter**: Generosity and loyalty in relationships

Remember, palm reading is a tool for self-reflection. Your relationship patterns are also shaped by your choices and personal growth.`,
    category: "Relationships",
    readTime: "6 min read",
    publishDate: "2024-01-12",
    author: "Palmtell Team",
    featured: true,
    icon: Heart
  },
  "career-success-palm-reading": {
    title: "Reading Your Career Path in Your Palm",
    excerpt: "Learn how the fate line, head line, and finger shapes reveal your professional strengths, career changes, and success potential.",
    content: `# Reading Your Career Path in Your Palm

Your palm holds clues about your natural talents, work style, and career potential. Whether you're considering a career change or looking to understand your professional strengths, palmistry offers valuable insights.

## The Fate Line: Your Career Path

The fate line represents your life purpose and career direction:

### Fate Line Characteristics
- **Clear and deep**: Strong sense of purpose, likely career success
- **Wavy or broken**: Multiple career changes, adaptability
- **Starting from wrist**: Early career focus, clear direction from youth
- **Starting from heart line**: Career discovery in adulthood
- **Absent or faint**: More control over own destiny, self-directed path

## The Head Line and Professional Skills

Your head line reveals your thinking style and intellectual strengths:

- **Long and straight**: Logical, organized thinker, good at planning
- **Curved**: Creative thinker, adaptable, good problem solver
- **Short**: Practical, focused on immediate results
- **Connected multiple ways**: Versatile professional, multiple talents

## Finger Analysis for Career

### Apollo Finger (Ring Finger)
- Long: Natural leader, creative success
- Short: Less focus on career achievement, values other life areas

### Mercury Finger (Pinky)
- Long: Excellent communicator, good in sales/negotiation
- Short: May prefer working behind scenes

### Jupiter Finger (Index)
- Long: Leadership potential, ambition
- Short: More comfortable supporting others than leading

## Professional Strengths by Mount

- **Mount of Jupiter**: Leadership, ambition
- **Mount of Saturn**: Discipline, serious work
- **Mount of Apollo**: Creativity, success
- **Mount of Mercury**: Communication, business

## Career Transitions

Multiple fate lines or changes in your fate line suggest you'll experience career transitions. This doesn't mean instability—many successful people have varied career paths.`,
    category: "Career",
    readTime: "7 min read",
    publishDate: "2024-01-10",
    author: "Palmtell Team",
    featured: true,
    icon: Brain
  },
  "palm-reading-myths-debunked": {
    title: "5 Common Palm Reading Myths Debunked",
    excerpt: "Separate fact from fiction in palmistry. We debunk the most common misconceptions about palm reading and what your lines really mean.",
    content: `# 5 Common Palm Reading Myths Debunked

Palmistry has been surrounded by myths and misconceptions for centuries. Let's separate fact from fiction.

## Myth 1: Your Life Line Length Determines How Long You'll Live

**False.** This is perhaps the most widespread misconception about palm reading. The life line actually represents the quality of your life, your physical vitality, and major life events—not your lifespan.

People with short life lines often live long, healthy lives. The life line is about living well, not living long.

## Myth 2: You Should Only Read Your Dominant Hand

**Not entirely true.** While your dominant hand does show your present and future, your non-dominant hand reveals your innate characteristics and past. Reading both hands gives you the complete picture.

Different cultures have different traditions about which hand to read, but the most comprehensive reading includes both.

## Myth 3: One Reading Predicts Your Future

**False.** Palmistry is a tool for self-reflection and understanding, not prediction. Your palm changes throughout your life based on your experiences and choices. A reading is a snapshot of where you are now.

Your future is not written in stone—it's something you actively create.

## Myth 4: Everyone Has the Same Lines

**False.** While everyone has major lines (heart, head, life, fate), they vary greatly in appearance, position, and characteristics. Your unique palm print is as individual as your fingerprints.

No two people have identical palms, making each reading unique.

## Myth 5: If You Don't Have a Fate Line, You Have No Purpose

**False.** Not everyone has a visible fate line, and that's completely normal. People without prominent fate lines often have more control over their destiny and create their own paths.

A faint or missing fate line doesn't mean lack of career success—it may just mean your path is more self-directed.

## The Real Purpose of Palmistry

Palmistry is best used as:
- A tool for self-discovery
- A way to understand personality tendencies
- An inspiration for reflection on life choices
- A complement to other forms of personal insight

Focus on using palmistry as a mirror for self-understanding rather than as a crystal ball.`,
    category: "Palmistry Facts",
    readTime: "5 min read",
    publishDate: "2024-01-08",
    author: "Palmtell Team",
    featured: false,
    icon: Star
  },
  "hand-shapes-personality-types": {
    title: "Hand Shapes and Personality Types",
    excerpt: "Discover how the shape of your hand reveals your core personality traits, from earth hands to fire hands and everything in between.",
    content: `# Hand Shapes and Personality Types

The overall shape of your hand can reveal fundamental aspects of your personality and natural inclinations. Let's explore the four main hand shapes.

## Earth Hands

**Characteristics**: Square palm, short fingers, thick thumb

**Personality traits**:
- Practical and grounded
- Reliable and dependable
- Prefer concrete results over theory
- Good with hands-on work
- Loyal friends and partners
- May resist change

**Career fits**: Trades, farming, construction, practical management

## Air Hands

**Characteristics**: Square palm, long fingers, thin lines

**Personality traits**:
- Intellectual and communicative
- Curious and analytical
- Love mental stimulation
- May overthink situations
- Good networkers
- Adaptable to change

**Career fits**: Writing, teaching, sales, research, communication

## Fire Hands

**Characteristics**: Long palm, short fingers, warm appearance

**Personality traits**:
- Enthusiastic and energetic
- Passionate about interests
- Natural leaders
- Can be impulsive
- Creative and confident
- Enjoy adventure

**Career fits**: Entrepreneurship, entertainment, sports, leadership roles

## Water Hands

**Characteristics**: Long palm, long fingers, sensitive appearance

**Personality traits**:
- Intuitive and emotional
- Sensitive to others' feelings
- Creative and imaginative
- May be moody
- Dream-oriented
- Artistic tendencies

**Career fits**: Arts, counseling, psychology, creative fields, nursing

## Combined Analysis

Your hand shape works together with your lines to provide complete personality insights. For example:
- An air hand with a strong head line is a natural analyst
- A water hand with a prominent heart line is deeply empathetic
- A fire hand with a defined fate line has clear ambitions
- An earth hand with strong mounts has practical success

Remember that hand shape provides a framework for understanding, but individual lines and mounts add nuance to the reading.`,
    category: "Personality",
    readTime: "6 min read",
    publishDate: "2024-01-05",
    author: "Palmtell Team",
    featured: false,
    icon: Hand
  },
  "palmistry-history-ancient-wisdom": {
    title: "The Ancient History of Palmistry",
    excerpt: "Explore the fascinating 5,000-year history of palm reading, from ancient India to modern AI-powered analysis.",
    content: `# The Ancient History of Palmistry

Palmistry is one of the oldest divination practices, with a rich history spanning thousands of years across multiple civilizations. Let's journey through time to understand how palm reading evolved.

## Ancient Origins

### Ancient India (3000 BCE)
The earliest recorded references to palmistry appear in ancient Indian texts. The practice was integrated into Vedic astrology and recognized by ancient Indian scholars as a legitimate science of character reading.

### Ancient China (1000 BCE)
Chinese practitioners developed their own systems of hand analysis, which influenced other Eastern practices. Chinese palmistry emphasized the relationship between hand characteristics and destiny.

### Ancient Egypt (1500 BCE)
Egyptians studied hand markings and believed they contained messages from the gods. Some scholars suggest that Egyptian priests used hand analysis for counseling pharaohs.

## Development in Europe

### Greece and Rome
Greek philosophers, including Aristotle, wrote about the relationship between palm characteristics and personality. Romans respected the practice and incorporated it into their culture.

### Medieval Period
During the Middle Ages, palmistry was studied alongside other forms of divination. Many practitioners were accused of witchcraft, making the practice dangerous to pursue openly.

### Renaissance (1400s-1600s)
The Renaissance brought renewed interest in palmistry as a legitimate science. Scholars like Johannes Hartlieb wrote comprehensive texts on palm reading, establishing frameworks that influenced modern practice.

## Modern Era Development

### 19th Century
Palmistry experienced a revival with figures like Cheiro (Count Louis Hamon) who popularized modern palmistry. His readings of famous historical figures brought credibility and widespread interest to the practice.

### 20th Century
Palmistry became systematized with detailed categorization of lines, mounts, and characteristics. Numerous schools and approaches developed, from scientific to spiritual perspectives.

### 21st Century: AI-Powered Palmistry
Today, technology has enhanced palmistry through:
- High-resolution image analysis
- Machine learning algorithms
- Instant accessibility to readings
- Scientific validation of traditional observations

## Global Traditions

### India
Continues the Vedic tradition, integrating palmistry with astrology and numerology

### China
Practices hand analysis as part of traditional medicine and feng shui

### Middle East
Maintains Islamic perspectives on palmistry and character reading

### Western Traditions
Focuses on psychological profiling and self-discovery applications

## Why Palmistry Endures

For thousands of years, humans have sought self-understanding. Palmistry persists because:
1. **Universal accessibility** - Everyone has hands to read
2. **Psychological value** - Provides framework for self-reflection
3. **Personal relevance** - Readings feel meaningful and specific
4. **Cultural integration** - Exists in traditions worldwide
5. **Scientific interest** - Modern research validates some traditional observations

From ancient priests to modern AI, palmistry continues to fascinate and provide insight into human nature.`,
    category: "History",
    readTime: "9 min read",
    publishDate: "2024-01-03",
    author: "Palmtell Team",
    featured: false,
    icon: BookOpen
  }
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return {
      title: "Blog Post Not Found | Palmtell",
    };
  }

  return {
    title: `${post.title} | Palmtell`,
    description: post.excerpt,
    keywords: `${post.category}, palmistry, palm reading`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  const IconComponent = post.icon;

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{post.category}</p>
              <p className="text-xs text-muted-foreground">By {post.author}</p>
            </div>
          </div>
          
          <h1 className="font-serif text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
            <div>{new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-border/40">
          <CardContent className="py-8 prose prose-sm max-w-none dark:prose-invert">
            <div className="space-y-6 text-foreground">
              {post.content.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('#')) {
                  const level = paragraph.match(/^#+/)?.[0].length || 1;
                  const text = paragraph.replace(/^#+\s/, '');
                  
                  // Render heading based on level
                  if (level === 1 || level === 2) {
                    return <h2 key={i} className="text-2xl font-semibold mt-6 mb-3">{text}</h2>;
                  } else if (level === 3) {
                    return <h3 key={i} className="text-xl font-semibold mt-5 mb-2">{text}</h3>;
                  } else {
                    return <h4 key={i} className="text-lg font-semibold mt-4 mb-2">{text}</h4>;
                  }
                }
                if (paragraph.startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc list-inside space-y-2">
                      {paragraph.split('\n').map((item, j) => (
                        <li key={j} className="text-sm">{item.replace(/^-\s/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.match(/^\d+\./)) {
                  return (
                    <ol key={i} className="list-decimal list-inside space-y-2">
                      {paragraph.split('\n').map((item, j) => (
                        <li key={j} className="text-sm">{item.replace(/^\d+\.\s/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                
                return <p key={i} className="leading-relaxed text-sm">{paragraph}</p>;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Related posts */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold mb-6">More From The Blog</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(blogPosts)
              .filter(([postSlug]) => postSlug !== slug)
              .slice(0, 2)
              .map(([postSlug, relatedPost]) => {
                const PostIconComponent = relatedPost.icon;
                return (
                  <Link key={postSlug} href={`/blog/${postSlug}`}>
                    <Card className="border-border/40 hover:border-primary/40 transition-colors cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-primary mb-1">{relatedPost.category}</p>
                            <CardTitle className="text-base">{relatedPost.title}</CardTitle>
                          </div>
                          <PostIconComponent className="h-5 w-5 text-muted-foreground ml-2" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{relatedPost.excerpt}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {relatedPost.readTime}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
