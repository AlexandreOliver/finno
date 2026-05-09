import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterForm from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function Page() {
  return (
    <Card className="w-100">
      <CardHeader className="text-center">
        <CardTitle>Crie seu Usuario</CardTitle>
        <CardDescription>Preencha com suas informações</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 justify-center items-center">
        <Link href="/auth/signin" className="font-medium text-sm text-sky-500">
          Faça Login
        </Link>
      </CardFooter>
    </Card>
  );
}
