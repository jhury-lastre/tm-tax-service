import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';

@Entity('client_income_types')
export class ClientIncomeType {
  @PrimaryColumn('varchar')
  name!: string;

  @Column('text')
  description!: string;

  @OneToMany('ClientIncome', 'incomeTypeEntity')
  clientIncomes!: any[];
} 