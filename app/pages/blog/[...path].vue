<script setup lang="ts">
const route = useRoute('blog-post')
const router = useRouter()

interface Post {
  title: string
  date: string
  body: string
}

const fakePosts: Record<string, Post> = {
  'hello-world': {
    title: 'Hello World',
    date: 'Jan 28, 2026',
    body: '<p>This is the first post.</p>',
  },
  'server-components': {
    title: 'Server Components',
    date: 'Jan 29, 2026',
    body: '<p>Zero JS is great.</p>',
  },
}

const slug = computed<string>(() => {
  const pathParam = route.params.path
  return Array.isArray(pathParam) ? pathParam.join('/') : pathParam
})

const post = computed(() => {
  const s = slug.value
  return s ? fakePosts[s] : null
})

definePageMeta({
  name: 'blog-post',
  // alias: ['/:path(.*)*'],
})

useSeoMeta({
  title: () => $t('blog.post.title'),

  // description: () => `Blog Article ${post.value}@${post.value}`,
})
</script>

<template>
  <main class="container py-8 sm:py-12 w-full">
    <!-- Header -->
    <header class="mb-8 pb-8 border-b border-border">
      <div class="">I AM A WEAK HEADER</div>
    </header>

    <article v-if="post">
      <BlogPost :title="post.title" :date="post.date" :html-content="post.body" />
    </article>

    <article v-else>
      <h1>Post Not Found</h1>
      <p>We couldn't find a post at /blog/{{ slug }}</p>
    </article>
  </main>
</template>
