import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'
import Users from './Users'
import { Field, ObjectType } from 'type-graphql'

@Entity()
@ObjectType()
export class Posts extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column()
  title!: string

  @Field()
  @Column()
  image!: string

  @Field()
  @Column()
  content!: string

  @Field()
  @Column({ type: 'int', default: 0 })
  likes!: number

  @Field()
  @Column()
  creatorId: number

  @ManyToOne(() => Users, (user) => user.posts)
  creator: Users

  @Field()
  @CreateDateColumn()
  createdAt: Date

  @Field()
  @UpdateDateColumn()
  updatedAt: Date
}

export default Posts
