import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('client_income')
export class ClientIncome {
  @PrimaryGeneratedColumn('identity', { name: 'id' })
  id!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column('uuid', { name: 'client_id', nullable: true })
  clientId!: string | null;

  @Column('text', { name: 'tax_payer', nullable: true })
  taxPayer!: string | null;

  @Column('text', { nullable: true })
  payer!: string | null;

  @Column('varchar', { name: 'income_type', nullable: true })
  incomeType!: string | null;

  @Column('double precision', { nullable: true })
  amount!: number | null;

  @Column('text', { name: 'deleted_by', nullable: true })
  deletedBy!: string | null;

  @Column('timestamp with time zone', { name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @Column('text', { name: 'updated_by', nullable: true })
  updatedBy!: string | null;

  @Column('bigint', { nullable: true })
  year!: number | null;

  @Column('boolean', { name: 'is_extracted', default: false })
  isExtracted!: boolean;

  // Relations
  @ManyToOne('Client', 'incomes')
  @JoinColumn({ name: 'client_id' })
  client!: any;

  @ManyToOne('ClientIncomeType', 'clientIncomes')
  @JoinColumn({ name: 'income_type' })
  incomeTypeEntity!: any;
} 