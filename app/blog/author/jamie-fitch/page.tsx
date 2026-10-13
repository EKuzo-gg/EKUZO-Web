import AuthorPage, { type AuthorPost } from "@/components/blog/AuthorPage";
import { getAuthor, buildAuthorMetadata } from "@/lib/authors";

const SLUG = "jamie-fitch";

export const metadata = buildAuthorMetadata(getAuthor(SLUG));

// Card dates match each post's DATE_MODIFIED (the date its byline shows). Update both together.
const POSTS: AuthorPost[] = [
  {
    slug: "when-your-sons-only-friends-are-online",
    title: "When your son's only friends are online",
    date: "October 13, 2026",
    excerpt:
      "Are online gaming friends real? The question isn't online vs offline. It's whether he's alone in a lobby of strangers or on a team with the same people.",
    image: "/images/when-your-sons-only-friends-are-online-hero.jpg",
    category: "Perspective",
  },
];

export default function JamieFitchAuthorPage() {
  return <AuthorPage author={SLUG} posts={POSTS} />;
}
