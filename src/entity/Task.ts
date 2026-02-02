import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "tasks", synchronize: true })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "timestamptz" })
  deadline: Date;

  @Column({ type: "timestamptz", nullable: true })
  completed_at: Date;

  @Column({ type: "timestamptz", nullable: true })
  reminder_at: Date;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
