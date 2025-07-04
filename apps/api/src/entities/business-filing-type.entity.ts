import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ClientBusiness } from './client-business.entity';

@Entity('business_filing_types')
export class BusinessFilingType {
  @PrimaryColumn({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany('ClientBusiness', 'filingType')
  clientBusinesses!: ClientBusiness[];
} 