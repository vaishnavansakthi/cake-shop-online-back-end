import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.enum'; // Define roles like 'admin', 'customer'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  MobileNumber: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @Column({ type: 'enum', enum: Role, default: Role.Customer })
  role: Role;
}
