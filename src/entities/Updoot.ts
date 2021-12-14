import { Entity, ManyToOne, BaseEntity, PrimaryColumn } from 'typeorm'
import Users from './Users'
import Posts from './Posts'

// Many to many relationship
// user <-> posts
// user <- join table -> posts

@Entity()
export class Updoot extends BaseEntity {
  @PrimaryColumn()
  userId: number

  @ManyToOne(() => Users, (user) => user.updoots)
  user: Users

  @PrimaryColumn()
  postId: number

  @ManyToOne(() => Posts, (post) => post.updoots)
  post: Posts
}

export default Updoot
