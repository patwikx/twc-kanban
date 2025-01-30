'use server'

import {  NewPasswordSchema, RegisterUserSchema, ResetSchema, SettingsSchema } from "@/schemas";
import { prisma } from "@/lib/db";
import {  getUserByEmail, getUserById } from "@/data/user";
import {  sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { z } from "zod";
import { generatePasswordResetToken, generateVerificationToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";

import { getVerificationTokenByToken } from "@/data/verificiation-token";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { revalidatePath } from "next/cache";


  export const reset = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);
  
    if (!validatedFields.success) {
      return { error: "Invalid emaiL!" };
    }
  
    const { email } = validatedFields.data;
  
    const existingUser = await getUserByEmail(email);
  
    if (!existingUser) {
      return { error: "Email not found!" };
    }
  
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    );
  
    return { success: "Reset email sent!" };
  }
  
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
    return { success: "Confirmation email sent!" };
  };

