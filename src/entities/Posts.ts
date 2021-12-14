import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm'
import Users from './Users'
import { Field, ObjectType } from 'type-graphql'
import Updoot from './Updoot'

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

  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.posts)
  creator: Users

  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[]

  @Field()
  @CreateDateColumn()
  createdAt: Date

  @Field()
  @UpdateDateColumn()
  updatedAt: Date
}

export default Posts
