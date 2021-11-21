import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import Post from '../entities/Posts'
import { ApolloContext } from '../interfaces'

@Resolver()
class PostResolvers {
  @Query(() => [Post])
  async getPosts(@Ctx() { em }: ApolloContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  @Query(() => Post, { nullable: true })
  getPostById(
    @Arg('id') id: number,
    @Ctx() { em }: ApolloContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: ApolloContext
  ): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post!)
    return post
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() { em }: ApolloContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id })
    if (!post) {
      return null
    }

    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }

    return post
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: ApolloContext
  ): Promise<boolean> {
    const post = await em.findOne(Post, { id })
    if (!post) return false
    em.removeAndFlush(post)
    return true
  }
}

export default PostResolvers
