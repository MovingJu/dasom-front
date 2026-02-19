import SigninForm from "@/components/Auth/SigninForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 | DASOM",
  description: "다솜 로그인 페이지",
};

const SigninPage = () => {
  return <SigninForm />;
};

export default SigninPage;
