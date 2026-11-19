// Seed content for the Inkspire blog — realistic starter content.
export interface SeedTag {
  name: string
}

export interface SeedPost {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  published: boolean
  featured: boolean
  views: number
  category: string
  tags: string[]
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  daysAgo: number
  comments?: { name: string; email: string; content: string; approved: boolean }[]
}

export const SEED_CATEGORIES = [
  { name: 'Web Development', slug: 'web-development', description: 'Guides, patterns and tooling for modern web builders.', color: '#0d7a5f' },
  { name: 'Design', slug: 'design', description: 'Typography, layout, color and everything that makes the web beautiful.', color: '#c2410c' },
  { name: 'Productivity', slug: 'productivity', description: 'Systems, habits and workflows for people who make things.', color: '#b45309' },
  { name: 'Marketing', slug: 'marketing', description: 'SEO, newsletters and growth strategy for writers and founders.', color: '#be123c' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Slower, more intentional ways of living and working online.', color: '#4d7c0f' },
]

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`

export const SEED_POSTS: SeedPost[] = [
  {
    title: 'Building a Blog with Next.js 16: A Complete Developer Guide',
    slug: 'building-a-blog-with-nextjs-16-complete-guide',
    excerpt: 'From database schema to SEO-ready pages — a practical walkthrough of building a production blog with Next.js 16, Prisma and an admin dashboard you actually enjoy using.',
    coverImage: U('1461749280684-dccba630e2f6'),
    published: true,
    featured: true,
    views: 2841,
    category: 'Web Development',
    tags: ['Next.js', 'React', 'Prisma', 'Tutorial'],
    metaTitle: 'Building a Blog with Next.js 16: The Complete 2026 Guide',
    metaDescription: 'Learn how to build a production-ready blog with Next.js 16, Prisma and a custom admin dashboard — with server rendering, SEO and deployment covered step by step.',
    keywords: 'next.js blog, next.js 16 tutorial, prisma blog, admin dashboard',
    daysAgo: 2,
    comments: [
      { name: 'Priya Sharma', email: 'priya@example.com', content: 'This is the clearest explanation of the App Router I have read. The section on when to use server components vs client components finally made it click for me. Thank you!', approved: true },
      { name: 'Marcus Webb', email: 'marcus@example.com', content: 'Question — did you run into any issues with Prisma connection pooling on serverless? I am deploying to Vercel and seeing cold start latency.', approved: true },
      { name: 'Dana K.', email: 'dana@example.com', content: 'Would love a follow-up on image optimization with the new Image component!', approved: false },
    ],
    content: `Every few years the "right way" to build a blog changes. Static site generators, then SPAs, then hybrid frameworks — and now, in 2026, Next.js 16 with the App Router is the most complete answer yet. This post walks through the exact architecture I use, from database to deployment.

## Why Next.js for a blog?

A blog lives and dies by two things: reading experience and discoverability. Readers want instant pages; Google wants server-rendered HTML it can crawl without executing JavaScript. Next.js gives you both out of the box through Server Components and streaming rendering, while the client side stays interactive where it matters.

- **Server rendering by default.** Your article HTML is generated on the server and streamed to the browser. Crawlers get full content immediately.
- **Metadata API.** Titles, Open Graph images and canonical URLs are declared per-page, in TypeScript.
- **One deploy target.** Blog, admin dashboard and API routes ship together to Vercel as a single project.

## The stack I recommend

For most blogs the sweet spot looks like this:

1. **Next.js 16 + TypeScript** for the app
2. **Prisma with SQLite or Postgres** for posts, categories and comments
3. **Tailwind CSS + shadcn/ui** for a fast, consistent design system
4. **NextAuth or a signed session cookie** for admin access

> Keep the admin dashboard inside the same app. A separate CMS is another service to maintain, another deployment, another security surface. A protected \`/admin\` route with a database behind it is simpler and completely sufficient for a small team.

## Modeling content the boring, correct way

Resist the urge to store posts as JSON blobs. A relational schema — posts, categories, tags, comments — pays off the moment you want to filter by category, count views or moderate comments. Here is the shape that has never let me down:

\`\`\`ts
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  excerpt   String
  content   String
  published Boolean  @default(false)
  views     Int      @default(0)
  // ...category, tags, comments relations
}
\`\`\`

The single most underrated field is \`readTime\`. Compute it once on save (words ÷ 220) instead of recalculating on every request. Your readers will thank you for the honest estimate.

## Draft, preview, publish

The workflow that makes writing sustainable is a three-state pipeline: **draft → preview → publish**. Drafts live in the database, invisible to the public. The admin editor renders your markdown side-by-side so you never publish a typo. Publishing flips one boolean and regenerates the sitemap.

That's the whole loop. Write, preview, publish — and let the framework handle the rest.`,
  },
  {
    title: 'SEO in 2026: How to Get Your Blog Indexed and Ranking on Google',
    slug: 'seo-in-2026-get-your-blog-indexed-and-ranking',
    excerpt: 'Google has changed a lot since 2020 — AI Overviews, spam updates, Experience signals. Here is the SEO workflow that still works, from sitemap submission to content that earns links.',
    coverImage: U('1460925895917-afdab827c52f'),
    published: true,
    featured: true,
    views: 3962,
    category: 'Marketing',
    tags: ['SEO', 'Google', 'Content Strategy', 'Analytics'],
    metaTitle: 'SEO in 2026: The Complete Guide to Google Indexing',
    metaDescription: 'A practical 2026 SEO guide for bloggers: technical setup, Search Console, E-E-A-T, AI-era content strategy and the outreach tactics that still earn rankings.',
    keywords: 'seo 2026, google indexing, search console, blog ranking',
    daysAgo: 6,
    comments: [
      { name: 'Jonas Müller', email: 'jonas@example.com', content: 'The point about Search Console coverage reports is gold. I found 40 soft-404 pages on my site after reading this and fixed them within an afternoon.', approved: true },
      { name: 'Amara Osei', email: 'amara@example.com', content: 'How long did it take for your new domain to get first impressions? Mine has been indexed for 6 weeks with nothing yet.', approved: true },
    ],
    content: `Every blogger has experienced it: you publish something you are proud of, wait a week, search Google — and it is nowhere. Getting indexed is the first wall everyone hits, and in 2026 the wall is taller than it used to be. Here is the workflow that reliably clears it.

## Step one: make the site crawlable

Before writing a single "SEO-optimized" sentence, verify the technical floor:

1. **Server-rendered HTML.** If your content only appears after JavaScript executes, indexing is fragile. Next.js, Astro or Remix solve this by default.
2. **A sitemap that updates itself.** Generate \`/sitemap.xml\` from your database so every new post is included automatically.
3. **robots.txt that allows what matters.** Publish it, then check it — a stray \`Disallow: /\` has silenced more blogs than any algorithm update.
4. **One canonical URL per post.** Pick trailing slashes or not, www or not, and 301-redirect everything else. Duplicate URLs split your ranking signals.

## Step two: Google Search Console, seriously

Search Console is the only place where Google tells you the truth about your site. Submit your sitemap, then watch the **Coverage** and **Performance** reports weekly. The two numbers to care about early on:

- **Indexed pages** — if this stalls below your post count, request indexing manually for important URLs.
- **Impressions** — the leading indicator of rankings. You will see impressions months before you see clicks; they tell you Google has noticed you and is testing you.

## Step three: content Google can trust

The 2024–2026 spam updates were brutal for thin, mass-produced content. What survived was boring and simple: **pages that could only have been written by someone who actually did the thing.** That means:

- First-hand screenshots, numbers and mistakes from your own projects
- Specific claims you can defend ("I moved from 2.1s to 0.6s LCP" beats "fast websites matter")
- Author pages, an about section and a real identity — Experience and credibility are signals now

> Write for one reader, answer one question completely, and go deeper than the top three results combined. That is still the whole strategy.

## Step four: earn the first links

No new site ranks without links. Ignore link farms and guest-post marketplaces; the links that move rankings come from being genuinely useful:

- Publish one genuinely original resource per month (data, benchmarks, a free tool)
- Answer questions in communities where your topic lives, and link only when it truly helps
- Email five people who linked to similar resources, and show them yours adds something they missed

Indexing takes days. Trust takes months. Publish consistently for six months before you judge the results — the curve is flat, then it bends.`,
  },
  {
    title: 'Typography on the Web: Why Serif Headings Are Making a Comeback',
    slug: 'typography-on-the-web-serif-headings-comeback',
    excerpt: 'Sans-serif ruled the web for a decade. Then everyone got tired of looking at the same website. Here is the craft argument for serif display type — and how to use it well.',
    coverImage: U('1455390582262-044cdead277a'),
    published: true,
    featured: true,
    views: 1974,
    category: 'Design',
    tags: ['Typography', 'UI Design', 'Branding', 'Fonts'],
    metaTitle: 'Why Serif Headings Are Back: A Web Typography Guide',
    metaDescription: 'Serif display type is everywhere again. Learn why editorial typography returned, how to pair serif headings with sans body text, and practical rules that always work.',
    keywords: 'web typography, serif headings, font pairing, editorial design',
    daysAgo: 10,
    comments: [
      { name: 'Elena Rossi', email: 'elena@example.com', content: 'As someone who studied print design, seeing the web come back to serif faces feels like a homecoming. Great breakdown of the pairing rules.', approved: true },
    ],
    content: `Open five well-designed websites at random and count the headlines. Chances are most of them are serif — the exact typeface category designers spent the 2010s deleting. The flip happened quietly, somewhere between the flattest year of minimalism and the rise of AI-generated sameness. Readers stopped trusting websites that looked like every other website, and brands started looking for a voice again.

## Why serifs read as "credible"

Serif faces carry the visual memory of print: newspapers, books, academic journals. When a headline is set in a high-contrast serif, readers subconsciously borrow that editorial authority. A sans headline says *product*; a serif headline says *story*. For blogs and publications, the second promise is the correct one.

There is also a purely mechanical reason. Large text renders differently from small text. The thin strokes that make a serif elegant at 48px would smear at 14px — which is exactly why the classic pairing works so well:

1. **Serif display face for headlines** — Playfair Display, Source Serif, Fraunces
2. **Neutral sans for body and UI** — Inter, Source Sans, Geist
3. **Generous line-height (1.6–1.75) for body text** — readability before personality

## The rules that never fail

- **Two families, maximum three weights each.** Every additional weight is another decision you have to keep consistent.
- **Contrast the mood, not the species.** Pair a high-contrast serif with a low-contrast sans. Two decorative faces fight; a quiet sans lets the serif sing.
- **Size headlines to the content, not the design.** A 64px headline suits a homepage; a 34px headline suits an article page where reading, not impressing, is the task.

> Typography is the design you actually see most. Get it right and nobody notices it — they just stay longer.

## Practically, in Tailwind

The whole upgrade is two CSS variables and one utility class. Load a display serif with \`next/font\`, map it to a \`font-serif\` theme token, and apply it to headings only. Body text stays in your sans. Five minutes of work, and the entire page reads as intentional instead of default.

The comeback of the serif is not nostalgia. It is the market correcting ten years of visual monotony — and it is the cheapest, fastest upgrade any blog can make.`,
  },
  {
    title: 'The Deep Work Playbook: How I Write 2,000 Words Before Breakfast',
    slug: 'deep-work-playbook-write-2000-words-before-breakfast',
    excerpt: 'Not a productivity sermon — the actual system: a 5:45 alarm, a 90-minute block, three rules that protect it, and what to do on the days it all falls apart.',
    coverImage: U('1517842645767-c639042777db'),
    published: true,
    featured: false,
    views: 1523,
    category: 'Productivity',
    tags: ['Deep Work', 'Habits', 'Writing', 'Morning Routine'],
    metaTitle: 'The Deep Work Playbook: 2,000 Words Before Breakfast',
    metaDescription: 'A realistic deep work system for writers: one protected 90-minute morning block, three simple rules, energy management and a recovery protocol for failed days.',
    keywords: 'deep work, morning routine, writing habits, productivity system',
    daysAgo: 14,
    comments: [
      { name: 'Tom Becker', email: 'tom@example.com', content: 'The "parking downhill" trick at the end changed everything for me. I used to end sessions exactly at a stopping point and dread starting again.', approved: true },
      { name: 'Rita Alves', email: 'rita@example.com', content: 'Curious whether you track word counts long-term or just per session? I find streak pressure makes my writing worse.', approved: true },
    ],
    content: `I want to be honest up front: "2,000 words before breakfast" is not a talent flex. It is an arrangement — between an alarm clock, a closed door and three rules I almost never break. Anyone can copy the arrangement. Here it is, without the mythology.

## The block, not the day

The entire system is one **90-minute block, starting 5:45**, before email, before chat, before anyone can want anything from me. Everything outside that block is ordinary life with ordinary interruptions. Protecting one block is psychologically cheap; trying to make the whole day sacred is impossible.

The night before, I write the session's goal on an index card: *"Finish the section on outreach."* Not "write." A target you cannot miss is the difference between a writing session and typing practice.

## Three rules that do the real work

1. **No input before output.** No email, no news, no social feeds until the block ends. Morning input is where other people's priorities get installed into your head.
2. **The draft is allowed to be bad.** I do not edit before the timer ends. Editing is a different mental mode, and switching modes mid-block is how ninety minutes evaporate.
3. **Park downhill.** I stop mid-sentence, mid-thought, with the next line already known. Hemingway did it; it works. Starting tomorrow's session inside a moving sentence eliminates the cold-start problem entirely.

## Energy is the real resource

Some mornings the words come slowly, and I have stopped diagnosing that as a character flaw. Writing output tracks sleep, walks and food far more tightly than it tracks motivation. The routine is fixed; the expectations flex.

> A bad 90-minute block still beats a good distracted afternoon. The compound interest is in showing up, not in any single session.

## When it all falls apart

Travel, sick kids, deadlines — the block dies sometimes. The recovery protocol matters more than the streak: never miss twice. One missed day is life. Two missed days is a new habit forming, and that is the one worth being afraid of.`,
  },
  {
    title: 'Deploying on Vercel: Everything You Need to Know (and a Few Things You Don\'t)',
    slug: 'deploying-on-vercel-everything-you-need-to-know',
    excerpt: 'Git-push deploys, preview URLs, edge caching, environment variables and the pricing tiers explained honestly — a field guide from someone who runs production sites on it.',
    coverImage: U('1517694712202-14dd9538aa97'),
    published: true,
    featured: false,
    views: 1188,
    category: 'Web Development',
    tags: ['Vercel', 'Deployment', 'DevOps', 'Next.js'],
    metaTitle: 'Deploying on Vercel: The Honest Field Guide',
    metaDescription: 'How Vercel deployment really works: git-based deploys, preview environments, env vars, caching, pricing tiers and when you should look elsewhere.',
    keywords: 'vercel deployment, vercel pricing, next.js hosting, preview deployments',
    daysAgo: 21,
    content: `Deploying used to be a weekend project. Then Vercel made it a push command — \`git push\`, and forty seconds later there is an HTTPS URL with a CDN in front of it. After running several production sites on it, here is what actually matters, stripped of the marketing.

## The mental model

Vercel treats **every git branch as a deployment**. Your production branch deploys to your domain; every other branch gets a permanent preview URL. This changes team dynamics more than any performance feature: designers, clients and reviewers react to a live link instead of screenshots.

1. **Connect the repo** — import from GitHub, Vercel detects the framework, builds it with defaults that are almost always correct.
2. **Set environment variables** — database URLs, API keys, secrets — per environment (production, preview, development).
3. **Push** — builds are cached and incremental, so most deploys complete in under a minute.

## What you genuinely need to know

- **Environment variables are scoped.** A variable set only for production will make every preview deployment crash in a confusing way. Set sensible defaults for preview too.
- **Serverless functions have cold starts.** Database connections must be pooled (HTTP-based drivers like Neon or PlanetScale's driver adapters, or Prisma Accelerate).
- **The Hobby tier is generous but non-commercial.** It is perfect for portfolios and personal blogs; the moment a site earns money or serves a client, move to Pro.
- **Analytics and Speed Insights are one toggle each.** Real-user Core Web Vitals without any instrumentation code.

> The biggest mistake is treating Vercel like a traditional VPS. You do not manage uptime, certificates or load balancers — you manage code and environment variables. Everything else is their problem, which is exactly the point.

## When to look elsewhere

Honesty requires the caveats. If you need long-running processes, heavy background jobs or full database servers, a small VPS is cheaper. If your team is deep into AWS already, Amplify may integrate better. Vercel is optimized for the framework it builds — for a Next.js blog, that optimization is close to unbeatable.`,
  },
  {
    title: 'From Side Project to Sustainable Income: The Honest Math of Blog Monetization',
    slug: 'honest-math-of-blog-monetization',
    excerpt: 'Affiliate links, ads, sponsorships and products — what each actually pays at different traffic levels, with the real numbers behind my first two years of blogging.',
    coverImage: U('1454165804606-c3d57bc86b40'),
    published: true,
    featured: false,
    views: 2467,
    category: 'Marketing',
    tags: ['Monetization', 'Affiliate', 'Sponsorship', 'Business'],
    metaTitle: 'Blog Monetization: The Honest Math (Real Numbers)',
    metaDescription: 'What affiliate links, display ads and sponsorships actually pay at 10k, 50k and 100k monthly pageviews — the honest economics of blog monetization.',
    keywords: 'blog monetization, affiliate income, sponsored posts, blog revenue',
    daysAgo: 28,
    comments: [
      { name: 'Kevin Park', email: 'kevin@example.com', content: 'Thank you for publishing actual numbers instead of vague screenshots. The RPM comparison table matches my own ad experience almost exactly.', approved: true },
    ],
    content: `Most monetization advice is written by people whose income comes from selling monetization advice. So instead of tips, here is arithmetic — the ranges I have personally seen or verified across my own blogs and friends' sites.

## The four streams, ranked by what they actually pay

**1. Display ads — volume business, weak start.** Premium ad networks pay roughly **$10–$30 RPM** (per 1,000 pageviews) once you qualify, typically at 50k+ monthly pageviews. At 10k pageviews you are looking at $50–150/month. Real, but it cannot carry a blog alone.

**2. Affiliate links — intent business.** A reader who clicks your link *because they are deciding what to buy* is worth 10–100× an ad impression. Software affiliates (hosting, tools, courses) commonly pay 20–40% recurring or $20–200 one-time per sale. Ten referred software subscriptions can out-earn 100k ad impressions.

**3. Sponsorships — trust business.** Once you have authority in a niche, sponsors pay $300–$1,500 per dedicated post for a 20k-pageview newsletter/blog, sometimes more. The catch: trust is the inventory. Burn it with junk sponsors and both streams die.

**4. Your own product — margin business.** Templates, courses, ebooks at $20–$200 sell at conversion rates of 0.5–2% of engaged readers. 5,000 engaged readers × 1% × $50 = $2,500/month. Nothing else scales this well, because you keep the customer relationship.

## The honest sequence

- **0–10k pageviews:** monetize nothing. Write, learn SEO, collect emails. Chasing pennies now costs more in credibility than it pays.
- **10–50k:** add 2–3 genuine affiliate integrations (things you actually use) and open a newsletter.
- **50k+:** join a premium ad network, take selective sponsorships, and launch a small product.

> Money from a blog is a lagging indicator of trust. Optimize the trust; the lag is only a few months.

The uncomfortable summary: the first year pays nothing, the second year pays rent-adjacent money, and the third year can pay a salary. Blogs compound — which is exactly why so few people finish them.`,
  },
  {
    title: 'Email Newsletters: The Most Underrated Growth Channel for Writers',
    slug: 'email-newsletters-underrated-growth-channel',
    excerpt: 'Your RSS reader has 12 users and your Twitter reach is 4%. Your email list belongs to you. How to start, what to send, and how to grow it without gimmicks.',
    coverImage: U('1499750310107-5fef28a66643'),
    published: true,
    featured: false,
    views: 986,
    category: 'Marketing',
    tags: ['Newsletter', 'Email Marketing', 'Growth', 'Writing'],
    metaTitle: 'Email Newsletters for Writers: The Underrated Growth Channel',
    metaDescription: 'Why email outperforms social media for writers, how to start a newsletter that people open, and growth tactics that respect your readers.',
    keywords: 'email newsletter, newsletter growth, email marketing for bloggers',
    daysAgo: 35,
    content: `Here are two numbers that should reorganize your marketing priorities. On most social platforms, roughly **2–6% of your followers** see any given post. On a healthy email list, **35–55% of subscribers open every issue**. The algorithm is a landlord; the inbox is owned land.

## Why email wins for writers specifically

A newsletter converts your writing into a habit. Social posts compete with 500 other signals; an email competes with the reader's morning coffee. And unlike a platform audience, a list is portable — you can change providers, redesign your site, even change your name, and the relationship survives.

1. **Start embarrassingly simple.** One weekly or biweekly email: what you published, why it matters, one link. Fancy templates can wait; consistency cannot.
2. **The signup form sells a benefit, not a blog.** "Get my guide to X in your inbox every Friday" outperforms "Subscribe to my newsletter" by a wide margin, every time it is tested.
3. **Offer one real incentive.** A checklist, a template, a short guide. It converts 2–4× better than no incentive and filters for the readers you actually want.

## What to send when you have nothing to say

The format that never fails: **one idea, one story, one recommendation.** Under 400 words. People do not open emails to read essays — they open them because last week's email was worth three minutes.

> The list grows in four boring ways: a visible signup form on every page, a clear incentive, guest appearances on other newsletters in your niche, and time. All four are required.

## The metrics that matter

Ignore open rates after deliverability stabilizes (Apple Mail inflates them). Watch **click-through rate** — it measures whether your writing moves anyone — and **list growth rate**, the number that compounds. A list growing 5% monthly doubles in under two years. No social platform has ever doubled anyone's reach that reliably.`,
  },
  {
    title: 'Digital Minimalism for Creators: Doing Fewer Things, Better',
    slug: 'digital-minimalism-for-creators',
    excerpt: 'Six platforms, three side projects and 40 open tabs is not ambition — it is noise. A quieter framework for choosing what deserves your creative attention.',
    coverImage: U('1471107340929-a87cd0f5b5f3'),
    published: true,
    featured: false,
    views: 745,
    category: 'Lifestyle',
    tags: ['Minimalism', 'Focus', 'Creativity', 'Well-being'],
    metaTitle: 'Digital Minimalism for Creators: Fewer Things, Better',
    metaDescription: 'A calmer framework for creators overwhelmed by platforms and side projects: audits, one-project rules, attention budgets and the art of strategic quitting.',
    keywords: 'digital minimalism, creator burnout, focus, intentional work',
    daysAgo: 42,
    content: `The modern creator's default state is fragmentation: a podcast with three episodes, a newsletter with two subscribers, four social accounts posting irregularly, and a "quick" side project that eats weekends. It feels like ambition. It functions like noise.

Minimalism, applied to creative work, is not about owning less or doing less for its own sake. It is a curation discipline: **the deliberate choice to go deep on few things so they can actually compound.**

## The audit that starts everything

List every platform, project and recurring commitment that claims your creative hours. Then ask two questions of each:

1. **If I started today, would I choose this again?**
2. **What would happen if I quit it?** Be honest — often the answer is "nothing," which is information.

Everything that fails both questions gets archived. Not deleted — archived, which is emotionally easier and preserves the option to return deliberately instead of drifting back.

## The one-project rule

Creative depth requires uninterrupted months. Splitting evenings across three projects yields three half-things; spending a full quarter on one project yields a finished thing plus momentum. Sequence ambitions instead of parallelizing them.

> Scattered effort produces scattered results, and scattered results are indistinguishable from no results.

## Budget attention like money

Attention is finite and it is the only input that matters. I give every commitment a weekly cost in hours, and the total must fit under 30 — leaving slack for the unplanned, which always arrives. When a new opportunity appears, something of equal size must leave first. The discipline is not in saying no to bad things; it is in saying no to good things so the excellent one has room.

The paradox worth sitting with: every creator you admire for "doing so much" is usually running something that looks like this — one public output, one system behind it, and a suspicious amount of free time that is not free at all.`,
  },
  {
    title: '12 Tools I Actually Use Every Week (2026 Edition)',
    slug: 'tools-i-use-every-week-2026',
    excerpt: 'Draft in progress — the yearly tools roundup: writing stack, dev tooling, analytics and the one automation that saves me four hours a month.',
    coverImage: U('1486312338219-ce68d2c6f44d'),
    published: false,
    featured: false,
    views: 0,
    category: 'Productivity',
    tags: ['Tools', 'Workflow', 'Review'],
    daysAgo: 1,
    content: `## Draft outline

- Writing stack: editor, grammar pass, outlining tool
- Dev tooling: terminal, editor, AI pair programmer notes
- Analytics: privacy-friendly options comparison
- The automation: weekly metrics digest to email

Notes to self: update screenshots for 2026 versions, double-check current pricing, add the note about switching note-taking apps mid-year and why.`,
  },
]

export const SEED_SUBSCRIBERS = [
  'priya.sharma@example.com',
  'marcus.webb@example.com',
  'jonas.mueller@example.com',
  'amara.osei@example.com',
  'elena.rossi@example.com',
  'tom.becker@example.com',
  'rita.alves@example.com',
  'kevin.park@example.com',
  'dana.k@example.com',
]
