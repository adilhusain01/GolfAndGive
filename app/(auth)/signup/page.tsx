"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart } from "lucide-react";

export default function SignupPage() {
  const router  = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email:    data.email,
        password: data.password,
        options: {
          data:        { full_name: data.full_name },
          emailRedirectTo: `${location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("Check your email to confirm your account!");
      router.push("/login?verify=1");
    } catch (err: any) {
      toast.error(err.message ?? "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Heart className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join Golf & Give — play, win, and give back.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" placeholder="Arjun Singh" {...register("full_name")} />
              {errors.full_name && (
                <p className="text-destructive text-xs">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="arjun@email.com" {...register("email")} />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-3">
            After signing up, you'll choose your subscription plan and charity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
