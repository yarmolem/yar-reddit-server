import { GraphQLScalarType, Kind } from 'graphql'
import { Field, ObjectType } from 'type-graphql'
import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'

import Posts from './Posts'
import Updoot from './Updoot'

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value) // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)) // Convert hard-coded AST string to integer and then to Date
    }
    return null // Invalid hard-coded value (not an integer)
  }
})

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

  @OneToMany(() => Updoot, (updoot) => updoot.user)
  updoots: Updoot[]

  @Field(() => DateScalar)
  @CreateDateColumn()
  createdAt: Date = new Date()

  @Field(() => DateScalar)
  @UpdateDateColumn()
  updatedAt: Date = new Date()
}

export default Users
