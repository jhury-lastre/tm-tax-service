import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  firstName!: string;

  @Column('text')
  lastName!: string;

  @Column('text', { nullable: true })
  email!: string | null;

  @Column('text', { nullable: true })
  phone!: string | null;

  @Column('text', { nullable: true })
  address!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @Column('text', { name: 'created_by', nullable: true })
  createdBy!: string | null;

  @Column('text', { name: 'updated_by', nullable: true })
  updatedBy!: string | null;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @Column('text', { name: 'deleted_by', nullable: true })
  deletedBy!: string | null;

  @OneToMany('ClientIncome', 'client')
  incomes!: any[];

  @OneToMany('ClientBusiness', 'client')
  businesses!: any[];
} 