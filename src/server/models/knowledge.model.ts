import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { BaseEntity } from "../database/base.model";

@Entity("knowledge_base_entries")
@Index(["isActive", "createdAt"])
export class KnowledgeBaseItem extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 500 })
  question!: string;

  @Column({ type: "text" })
  answer!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
