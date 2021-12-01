import { Arg, Mutation, Query, Resolver } from 'type-graphql'

import Post from '../entities/Posts'

@Resolver()
class PostResolvers {
  @Query(() => [Post])
  async getPosts(): Promise<Post[]> {
    return Post.find()
  }

  @Query(() => Post, { nullable: true })
  getPostById(@Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    return Post.create({ title }).save()
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string
  ): Promise<Post | null> {
    if (!title) return null

    const post = await Post.findOne({ where: { id } })
    if (!post) return null

    await Post.update({ id }, { title })

    return post
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete({ id })
    } catch (error) {
      console.log('[ERROR DELETING POST]', error)
      return false
    }
    return true
  }
}

export default PostResolvers
