// Shared client-side types mirroring the Prisma models.
export interface Author {
  id: string
  name: string
  bio?: string | null
  avatar?: string | null
  email?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  color: string
  _count?: { posts: number }
}

export interface Tag {
  id: string
  name: string
  slug: string
  _count?: { posts: number }
}

export interface CommentItem {
  id: string
  name: string
  email: string
  content: string
  approved: boolean
  postId: string
  createdAt: string
  post?: { title: string; slug: string }
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  published: boolean
  featured: boolean
  views: number
  readTime: number
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string | null
  authorId?: string | null
  author?: Author | null
  categoryId?: string | null
  category?: Category | null
  tags: { tag: Tag }[]
  comments?: CommentItem[]
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: string
  siteName: string
  tagline: string
  aboutTitle: string
  aboutText: string
  twitter?: string | null
  github?: string | null
  linkedin?: string | null
  contactEmail?: string | null
  metaKeywords?: string | null
  metaDescription?: string | null
  updatedAt?: string
  author?: { name: string; avatar?: string | null; bio?: string | null } | null
}

export interface Stats {
  publishedPosts: number
  draftPosts: number
  totalViews: number
  pendingComments: number
  approvedComments: number
  subscribers: number
  categories: number
  recentPosts: {
    id: string
    title: string
    published: boolean
    views: number
    createdAt: string
    category?: { name: string; color: string } | null
  }[]
  topPosts: { id: string; title: string; views: number }[]
}

export interface PostPayload {
  title: string
  slug?: string
  excerpt: string
  content: string
  coverImage?: string | null
  published?: boolean
  featured?: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  keywords?: string | null
  categoryId?: string | null
  tags?: string[]
}
