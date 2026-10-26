import AuthorPage, { type AuthorPost } from "@/components/blog/AuthorPage";
import { getAuthor, buildAuthorMetadata } from "@/lib/authors";

const SLUG = "karlin-oei";

export const metadata = buildAuthorMetadata(getAuthor(SLUG));

// Card dates match each post's DATE_MODIFIED (the date its byline shows). Update both together.
const POSTS: AuthorPost[] = [
  {
    slug: "should-i-buy-my-kid-robux",
    title: "She asked for Robux to learn about money. Her dad said yes.",
    date: "October 26, 2026",
    excerpt:
      "For a year the answer was no. At eight, she changed her pitch.",
    image: "/images/should-i-buy-my-kid-robux-card.jpg",
    category: "Perspective",
  },
  {
    slug: "gaming-study-13-7-years-younger-what-it-means-for-kids",
    title:
      "The gaming study everyone shared, and what it means for your twelve-year-old",
    date: "October 12, 2026",
    excerpt:
      "A doctor's one-liner about a gaming study reached 30M+ people. Karlin read a thousand of the replies. The one that mattered wasn't about the study.",
    image: "/images/gaming-study-13-7-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-your-kids-gaming-is-telling-you",
    title: "What your kid's gaming is telling you",
    date: "October 26, 2026",
    excerpt:
      "The game is visible. The meaning is hidden. Six signs parents notice first in a gamer kid, and what they often mean.",
    image: "/images/what-your-kids-gaming-is-telling-you-card.jpg",
    category: "Perspective",
  },
  {
    slug: "what-homeschool-parents-taught-us-about-gaming",
    title: "Should homeschool kids play video games? 200+ parents weigh in",
    date: "October 13, 2026",
    excerpt:
      "We read a 200+ parent thread on kids and gaming. Three camps, the language they use, and the one structured, social, supervised thing they all want.",
    image: "/images/blog-post-6-card.jpg",
    category: "Case Studies",
  },
  {
    slug: "when-gaming-helps-homeschool-kids",
    title: "When gaming helps homeschool kids and when it hurts",
    date: "October 13, 2026",
    excerpt:
      "Gaming can grow a homeschooled kid or shrink their world. What decides which, why structure beats hours, and how to tilt it your way.",
    image: "/images/blog-post-5-card.jpg",
    category: "Guides",
  },
  {
    slug: "league-of-legends-youth-development",
    title: "Is League of Legends OK for kids? Why we coach it",
    date: "October 13, 2026",
    excerpt:
      "Why League of Legends works for youth development when the structure is right. The honest answer on toxicity and what coached play actually teaches kids.",
    image: "/images/blog-post-4-card.jpg",
    category: "Guides",
  },
  {
    slug: "gaming-programs-for-kids",
    title: "Gaming programs for kids: a parent's guide, Fall 2026",
    date: "October 26, 2026",
    excerpt:
      "What a kid who games can join in fall 2026: build classes, online clubs, school teams, local leagues and coached teams, with prices checked in October.",
    image: "/images/blog-post-3-card.jpg",
    category: "Guides",
  },
];

export default function KarlinOeiAuthorPage() {
  return <AuthorPage author={SLUG} posts={POSTS} />;
}
