'use server'

import {  NewPasswordSchema, RegisterUserSchema, ResetSchema, SettingsSchema } from "@/schemas";
import { prisma } from "@/lib/db";
import {  getUserByEmail, getUserById } from "@/data/user";
import { z } from "zod";
import bcrypt from "bcryptjs";

  
  export const register = async (values: z.infer<typeof RegisterUserSchema>) => {
    const validatedFields = RegisterUserSchema.safeParse(values);
  
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
  
    const { email, password, firstName, lastName, contactNo, address, role, } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const existingUser = await getUserByEmail(email);
  
    if (existingUser) {
      return { error: "Email already in use!" };
    }
  
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        contactNo,
        role
      },
    });
    return { success: "User created successfully!" };
  };

