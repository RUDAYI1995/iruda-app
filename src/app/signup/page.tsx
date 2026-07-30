"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const schema = z.object({
  name: z.string().min(1, "닉네임을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 해요"),
  gender: z.enum(["MALE", "FEMALE"], { message: "성별을 선택해주세요" }),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [testLoggingIn, setTestLoggingIn] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setServerError(data.error ?? "가입 중 오류가 발생했어요");
      return;
    }

    router.push("/login");
  };

  const handleTestLogin = async () => {
    setServerError(null);
    setTestLoggingIn(true);
    const res = await signIn("credentials", {
      testLogin: "1",
      redirect: false,
    });
    setTestLoggingIn(false);

    if (res?.error) {
      setServerError("테스트버전 로그인에 실패했어요");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          이루다 가입하기
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              닉네임
            </label>
            <input
              {...register("name")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              이메일
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              비밀번호
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              성별
            </label>
            <div className="flex gap-4 text-sm text-zinc-700 dark:text-zinc-300">
              <label className="flex items-center gap-1.5">
                <input type="radio" value="MALE" {...register("gender")} />
                남성
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" value="FEMALE" {...register("gender")} />
                여성
              </label>
            </div>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "가입 중..." : "가입하기"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-400">또는</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <button
          type="button"
          onClick={handleTestLogin}
          disabled={testLoggingIn}
          className="mt-4 w-full rounded-full border border-amber-300 bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
        >
          {testLoggingIn ? "테스트 계정으로 접속 중..." : "🧪 테스트버전 로그인 (회원가입 없이 체험하기)"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
