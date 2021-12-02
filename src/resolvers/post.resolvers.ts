import {
  Arg,
  Ctx,
  Field,
  Query,
  Mutation,
  Resolver,
  InputType,
  UseMiddleware
} from 'type-graphql'
import Post from '../entities/Posts'
import { isAuth } from '../middleware/isAuth'
import { ApolloContext } from '../interfaces'

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  image: string

  @Field()
  content: string
}

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

  @UseMiddleware(isAuth)
  @Mutation(() => Post)
  async createPost(
    @Ctx() { req }: ApolloContext,
    @Arg('input') input: PostInput
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId
    }).save()
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
