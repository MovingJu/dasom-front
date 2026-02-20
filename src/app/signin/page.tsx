import SigninForm from "@/components/Auth/SigninForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "로그인 | DASOM",
  description: "다솜 로그인 페이지",
};

const SigninPage = () => {
  return (
    <Suspense fallback={<div className="pt-[180px]" />}>
      <SigninForm />
    </Suspense>
  );
};

export default SigninPage;
