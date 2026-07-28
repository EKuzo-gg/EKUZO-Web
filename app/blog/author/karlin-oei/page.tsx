import AuthorPage, { type AuthorPost } from "@/components/blog/AuthorPage";
import { getAuthor, buildAuthorMetadata } from "@/lib/authors";

const SLUG = "karlin-oei";

export const metadata = buildAuthorMetadata(getAuthor(SLUG));

const POSTS: AuthorPost[] = [
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid's gaming is telling you",
    date: "May 24, 2026",
    excerpt:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "What 200+ homeschool parents taught us about gaming",
    date: "May 21, 2026",
    excerpt:
      "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.",
    image: "/images/blog-post-6-card.jpg",
    category: "Case Studies",
  },
  {
    slug: "when-gaming-helps-homeschool-kids",
    title: "When gaming helps homeschool kids and when it hurts",
    date: "May 21, 2026",
    excerpt:
      "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.",
    image: "/images/blog-post-5-card.jpg",
    category: "Guides",
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Why League of Legends is perfect for youth development",
    date: "May 16, 2026",
    excerpt:
      "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.",
    image: "/images/blog-post-4-card.jpg",
    category: "Guides",
  },
  {
    slug: "summer-camps-for-kids-who-game-2026",
    title:
      "Virtual summer camps for kids who'd rather be gaming (still open for summer 2026)",
    date: "May 14, 2026",
    excerpt:
      "A parent's guide to virtual summer camps for kids who game. Four categories, real cost ranges, and how to tell a coached program from a supervised hangout.",
    image: "/images/blog-post-3-card.jpg",
    category: "Guides",
  },
];

export default function KarlinOeiAuthorPage() {
  return <AuthorPage author={SLUG} posts={POSTS} />;
}
