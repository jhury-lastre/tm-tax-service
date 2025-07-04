import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { BusinessFilingType } from './business-filing-type.entity';

export interface BenefitItem {
  id: string;
  name: string;
  value: boolean;
}

export interface EntityItem {
  id: string;
  name: string;
  value: boolean;
}

@Entity('client_businesses')
export class ClientBusiness {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'text', nullable: true })
  name!: string | null;

  @Column({ name: 'filing_type', type: 'varchar', nullable: true })
  filingType!: string | null;

  @Column({ type: 'bigint', nullable: true })
  ownership!: number | null;

  @Column({ type: 'bigint', nullable: true })
  employees!: number | null;

  @Column({ 
    type: 'jsonb', 
    default: () => `'[{"id": "401K", "name": "401K", "value": false}, {"id": "life_insurance", "name": "Life Insurance", "value": false}, {"id": "health_insurance", "name": "Health Insurance", "value": false}, {"id": "sep_ira", "name": "SEP IRA", "value": false}]'::jsonb`
  })
  benefits!: BenefitItem[];

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy!: string | null;

  @Column({ name: 'gross_sales', type: 'double precision', nullable: true })
  grossSales!: number | null;

  @Column({ type: 'text', nullable: true })
  industry!: string | null;

  @Column({ type: 'double precision', nullable: true })
  k1!: number | null;

  @Column({ name: 'net_sales', type: 'double precision', nullable: true })
  netSales!: number | null;

  @Column({ name: 'projected_sales', type: 'double precision', nullable: true })
  projectedSales!: number | null;

  @Column({ type: 'double precision', nullable: true })
  w2!: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @Column({ type: 'bigint', nullable: true })
  year!: number | null;

  @Column({ 
    type: 'jsonb', 
    default: () => `'[{"id": "articles_incorporation", "name": "Articles of Incorporation", "value": false}, {"id": "operating_agreement", "name": "Operating Agreement", "value": false}, {"id": "ein", "name": "EIN", "value": false}, {"id": "annual_board_meetings", "name": "Annual Board Meetings", "value": false}, {"id": "separate_bank_accounts", "name": "Separate Bank Accounts", "value": false}, {"id": "gl_insurance", "name": "GL Insurance", "value": false}, {"id": "business_asset", "name": "Business Asset", "value": false}]'::jsonb`
  })
  entities!: EntityItem[];

  // Relationships
  @ManyToOne('Client', 'businesses', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @ManyToOne('BusinessFilingType', 'clientBusinesses')
  @JoinColumn({ name: 'filing_type' })
  businessFilingType!: BusinessFilingType;
} 