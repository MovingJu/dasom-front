"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LoginResponse = {
  ok?: boolean;
  error?: string;
};

const SigninForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "알 수 없는 오류";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                다솜 계정 로그인
              </h3>
              <p className="text-body-color mb-8 text-center text-base font-medium">
                글 작성은 로그인한 사용자만 가능합니다.
              </p>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="text-dark mb-2 block text-sm dark:text-white">
                    이메일
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@khu.ac.kr"
                    className="border-stroke text-body-color focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#332d31] dark:text-body-color-dark"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-dark mb-2 block text-sm dark:text-white">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="border-stroke text-body-color focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#332d31] dark:text-body-color-dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadow-submit bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:bg-primary/60"
                >
                  {isSubmitting ? "로그인 중..." : "로그인"}
                </button>
              </form>

              {message ? (
                <p className="mt-4 rounded-xs border border-primary/25 bg-primary/10 p-3 text-sm text-dark dark:text-white">
                  {message}
                </p>
              ) : null}

              <div className="mt-8 rounded-xs border border-primary/25 bg-primary/10 p-4 text-sm text-dark dark:text-white">
                테스트 계정: <code>admin@dasom.dev / dasom123!</code>
              </div>

              <p className="text-body-color mt-6 text-center text-base font-medium">
                계정이 없다면{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SigninForm;
