import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Role } from './role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(
    username: string,
    email: string,
    password: string,
    MobileNumber: string,
    role: Role,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      MobileNumber,
      role,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (user) {
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await this.userRepository.save(user);
    }
  }

  async deleteUser(userId: number): Promise<void> {
    // Find the user first
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Perform the delete operation
    const result = await this.userRepository.delete(userId);

    // Check if the delete operation was successful
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  // New updateProfile method
  async updateProfile(
    userId: number, // Assuming you're updating based on userId
    newUsername?: string,
    newEmail?: string,
    newMobileNumber?: string,
    newRole?: Role, // Optional, in case you need to update role
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update the profile fields if they are provided
    if (newUsername) {
      user.username = newUsername;
    }
    if (newEmail) {
      // Optionally, you can check for email uniqueness before updating
      const emailExists = await this.findByEmail(newEmail);
      if (emailExists && emailExists.id !== userId) {
        throw new NotFoundException('Email is already in use');
      }
      user.email = newEmail;
    }
    if (newMobileNumber) {
      user.MobileNumber = newMobileNumber;
    }
    if (newRole) {
      user.role = newRole;
    }

    // Save the updated user details
    return this.userRepository.save(user);
  }
}
