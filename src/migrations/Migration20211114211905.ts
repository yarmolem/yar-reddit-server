import { Migration } from '@mikro-orm/migrations';

export class Migration20211114211905 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "users" ("id" serial primary key, "username" text not null, "password" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "users" add constraint "users_username_unique" unique ("username");');

    this.addSql('create table "posts" ("id" serial primary key, "title" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
  }

}
