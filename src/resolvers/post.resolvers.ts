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
  FieldResolver,
  ObjectType
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { ApolloContext } from '../interfaces'
import { isAuth } from '../middleware/isAuth'
import Post, { Posts } from '../entities/Posts'
import Updoot from '../entities/Updoot'

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  image: string

  @Field()
  content: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Posts])
  posts: Posts[]

  @Field()
  hasMore: boolean
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

  // [x] Actualizar en la tabla posts cuantos likes tiene
  // [x] Actualizar en la tabla Updoot las referencias postId y userId
  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async likeAPost(
    @Ctx() { req }: ApolloContext,
    @Arg('postId', () => Int) postId: number
  ) {
    const hasPost = await Post.findOne(postId)

    if (!hasPost) {
      throw new Error(`dont exits a post with id: ${postId}`)
    }

    const { userId } = req.session
    const hasRelation = await Updoot.findOne({ where: { userId, postId } })

    const slideQueryUpdateLikes = !hasRelation
      ? 'SET likes = likes + 1'
      : 'SET likes = likes - 1'

    const slideQueryUpdateUpdoot = !hasRelation
      ? 'INSERT INTO updoot ("userId", "postId") values ($1, $2);'
      : 'DELETE FROM updoot WHERE "userId" = $1 AND "postId" = $2;'

    const updateUpdoots = getConnection().query(slideQueryUpdateUpdoot, [
      userId,
      postId
    ])

    const updatePost = getConnection().query(
      `
      UPDATE posts
      ${slideQueryUpdateLikes}
      WHERE id = $1;
    `,
      [postId]
    )

    try {
      await Promise.all([updateUpdoots, updatePost])
    } catch (error) {
      console.log(error)
      return false
    }

    return true
  }

  @Query(() => PaginatedPosts)
  async getPosts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const maxLimit = Math.min(50, limit)
    const testingLimits = maxLimit + 1
    const variables: [number, Date?] = [testingLimits]

    if (cursor) variables.push(new Date(+cursor))

    const posts = await getConnection().query(
      `
      SELECT p.*, 
      json_build_object(
        'id', u.id,
        'email', u.email,
        'username', u.username,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
      ) creator
      FROM posts p
      INNER JOIN users u on u.id = p."creatorId"
      ${cursor ? 'WHERE p."createdAt" < $2' : ''}
      ORDER BY p."createdAt" DESC
      LIMIT $1
    `,
      variables
    )

    // WITH QUERY BUILDER
    // const q = getConnection()
    //   .getRepository(Posts)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', 'DESC')
    //   .take(testingLimits)

    // if (cursor) {
    //   q.where('p."createdAt" < :cursor', { cursor: new Date(+cursor) })
    // }

    // const posts = await q.getMany()

    return {
      posts: posts.slice(0, maxLimit),
      hasMore: posts.length === testingLimits
    }
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
