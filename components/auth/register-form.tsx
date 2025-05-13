"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterUserSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserRole } from "@prisma/client";

import { register } from "@/actions/queries";
import { Card, CardContent, CardHeader } from "../ui/card";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterUserSchema>>({
    resolver: zodResolver(RegisterUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      contactNo: "",
      address: "",
      role: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterUserSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values)
        .then((data) => {
          setError(data.error);
          setSuccess(data.success);
          
          if (!data.error) {
            form.reset();
          }
        })
        .finally(() => {
          setTimeout(() => {
            setError(undefined);
            setSuccess(undefined);
          }, 5000);
        });
    });
  };

  return (
        <Card>
          <CardHeader className="font-semibold font-2xl">
            Create System User
          </CardHeader>
          <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="font-semibold">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder="Juan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="font-semibold">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder="Dela Cruz" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="email@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              

              <div className="flex w-full space-x-4">
                <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Role</FormLabel>
                      <FormControl>
                        <Controller
                          name="role"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={UserRole.VIEWER}>VIEWER</SelectItem>
                                <SelectItem value={UserRole.PURCHASER}>PURCHASER</SelectItem>
                                <SelectItem value={UserRole.TREASURY}>TREASURY</SelectItem>
                                <SelectItem value={UserRole.ACCTG}>Accounting</SelectItem>
                                <SelectItem value={UserRole.OWNER}>OWNER</SelectItem>
                                <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>  
              </div>
              <div className="flex w-full space-x-4">
                <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Address</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder="Complete address.." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                <div className="w-1/2">
                <FormField
                  control={form.control}
                  name="contactNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Contact No.</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isPending} placeholder="Contact number.." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
                
                
              </div>
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button disabled={isPending} type="submit" className="w-full">
              Create an account
            </Button>
          </form>
        </Form>
        </CardContent>
        </Card>
  );
};
