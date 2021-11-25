import { Field, ObjectType } from 'type-graphql'
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
@ObjectType()
export class Users {
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

  @Field()
  @CreateDateColumn()
  createdAt: Date = new Date()

  @Field()
  @UpdateDateColumn()
  updatedAt: Date = new Date()
}

export default Users
