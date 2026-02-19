import SignupForm from "@/components/Auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 | DASOM",
  description: "다솜 회원가입 페이지",
};

const SignupPage = () => {
  return <SignupForm />;
};

export default SignupPage;
