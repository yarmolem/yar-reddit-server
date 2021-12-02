import { Field, ObjectType } from 'type-graphql'
import {
  Entity,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm'
import Posts from './Posts'

@Entity()
@ObjectType()
export class Users extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number

  @Field()
  @Column({ unique: true })
  email!: string

  @Field()
  @Column({ unique: true })
  username!: string

  @Column()
  password!: string

  @OneToMany(() => Posts, (post) => post.creator)
  posts: Posts[]

  @Field()
  @CreateDateColumn()
  createdAt: Date = new Date()

  @Field()
  @UpdateDateColumn()
  updatedAt: Date = new Date()
}

export default Users
