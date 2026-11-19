import { db } from '@/lib/db'

/**
 * Production database auto-provisioner.
 *
 * Creates every table required by prisma/schema.prisma using idempotent
 * DDL (CREATE TABLE IF NOT EXISTS + inline constraints). This removes the
 * need to run `prisma db push` manually against a fresh cloud database
 * (e.g. a new Neon project): the first request that touches the DB creates
 * the schema, and the seed fills it with starter content.
 *
 * - Only runs when DATABASE_URL points at Postgres (production). On
 *   SQLite (local dev) the schema is managed by `prisma db push`, so this
 *   is skipped to avoid dialect mismatches.
 * - Safe to run concurrently and repeatedly: every statement is guarded
 *   with IF NOT EXISTS, and foreign keys are declared inline so a
 *   re-run against an existing database never fails.
 */

let schemaPromise: Promise<void> | null = null

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = provision().catch((e) => {
      schemaPromise = null
      throw e
    })
  }
  return schemaPromise
}

function isPostgres() {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgres://') || url.startsWith('postgresql://')
}

async function provision() {
  if (!isPostgres()) return

  const statements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "bio" TEXT,
      "avatar" TEXT,
      "role" TEXT NOT NULL DEFAULT 'ADMIN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "color" TEXT NOT NULL DEFAULT '#0d7a5f',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Tag" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "slug" TEXT NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS "Post" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "excerpt" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "coverImage" TEXT,
      "published" BOOLEAN NOT NULL DEFAULT false,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "views" INTEGER NOT NULL DEFAULT 0,
      "readTime" INTEGER NOT NULL DEFAULT 3,
      "metaTitle" TEXT,
      "metaDescription" TEXT,
      "keywords" TEXT,
      "authorId" TEXT,
      "categoryId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId")
        REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId")
        REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "PostTag" (
      "postId" TEXT NOT NULL,
      "tagId" TEXT NOT NULL,
      CONSTRAINT "PostTag_postId_tagId_pkey" PRIMARY KEY ("postId","tagId"),
      CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId")
        REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId")
        REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Comment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "approved" BOOLEAN NOT NULL DEFAULT false,
      "postId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId")
        REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS "Subscriber" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Settings" (
      "id" TEXT NOT NULL DEFAULT 'main' PRIMARY KEY,
      "siteName" TEXT NOT NULL DEFAULT 'Inkspire',
      "tagline" TEXT NOT NULL DEFAULT 'Stories, ideas & insights worth sharing',
      "aboutTitle" TEXT NOT NULL DEFAULT 'About Inkspire',
      "aboutText" TEXT NOT NULL,
      "twitter" TEXT,
      "github" TEXT,
      "linkedin" TEXT,
      "contactEmail" TEXT,
      "metaKeywords" TEXT,
      "metaDescription" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId")`,
    `CREATE INDEX IF NOT EXISTS "Post_categoryId_idx" ON "Post"("categoryId")`,
    `CREATE INDEX IF NOT EXISTS "PostTag_postId_idx" ON "PostTag"("postId")`,
    `CREATE INDEX IF NOT EXISTS "PostTag_tagId_idx" ON "PostTag"("tagId")`,
    `CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId")`,
  ]

  for (const sql of statements) {
    await db.$executeRawUnsafe(sql)
  }
}
