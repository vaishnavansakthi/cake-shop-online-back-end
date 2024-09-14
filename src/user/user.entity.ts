import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.enum'; // Define roles like 'admin', 'customer'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  resetOtp: string;

  @Column({ type: 'enum', enum: Role, default: Role.Customer })
  role: Role;
}
