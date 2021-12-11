import {
  Int,
  Arg,
  Ctx,
  Root,
  Field,
  Query,
  Mutation,
  Resolver,
  InputType,
  UseMiddleware,
  FieldResolver
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { ApolloContext } from '../interfaces'
import { isAuth } from '../middleware/isAuth'
import Post, { Posts } from '../entities/Posts'

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  image: string

  @Field()
  content: string
}

@Resolver(Posts)
class PostResolvers {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Posts) {
    if (root.content.trim().length <= 200) {
      return root.content
    }
    return `${root.content.slice(0, 200)}...`
  }

  @Query(() => [Post])
  async getPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const maxLimit = Math.min(50, limit)
    const q = getConnection().getRepository(Posts).createQueryBuilder('p')

    if (cursor) q.where('"createdAt" < :cursor', { cursor: new Date(+cursor) })

    return q.orderBy('"createdAt"', 'DESC').take(maxLimit).getMany()
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
