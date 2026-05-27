import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function Page() {
  return (
    <Card className="w-85">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription className="text-md">
          Entre com seu email e senha
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 justify-center items-center">
        <Link
          href="/forgotpassword"
          className="font-medium text-md text-sky-500"
        >
          Esqueci a senha
        </Link>
        <span className="font-medium text-md text-center">
          Não tem uma conta?{" "}
          <Link href="/auth/register" className="text-sky-500">
            Crie
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
