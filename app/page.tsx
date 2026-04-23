import Image from "next/image";
import { Wallet, Coins } from "lucide-react";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="h-20 md:h-50 m-4">
        <div className="h-full bg-blue-400 gap-2 rounded-lg p-4 items-end flex shrink-0 text-background">
          <Coins className="size-10" />
          <h1 className="text-5xl font-bold">Finno</h1>
        </div>
      </header>
      <main className="m-4 h-screen gap-4 flex grow flex-col md:flex-row">
        <div className="flex flex-col gap-3 bg-gray-50 rounded-md md:w-2/5 py-10 md:py-26 px-6 md:px-26">
          <div className="flex flex-col gap-6">
            <Wallet size={54} />
            <h1 className="text-2xl md:text-4xl text-foreground">
              <span className="font-bold">Seja Bem Vindo</span>
            </h1>
          </div>
          <div>
            <p className=" text-xl md:text-2xl text-foreground">
              A Finno é uma Plataforma voltada a gestão de seus gastos
              financeiros.
            </p>
          </div>
          <div className="flex flex-row justify-center rounded-md bg-blue-600 p-2 w-1/4 text-background">
            <Link href="login/" className="text-xl flex flex-row gap-4">
              Log In
              <span>
                <ArrowRightIcon />
              </span>
            </Link>
          </div>
        </div>
        <div className="md:w-3/5 rounded-md flex justify-center items-center shrink-0 bg-gray-100">
          <Image
            src="/home-finance.jpg"
            alt="Imagem generica de finanças"
            height={700}
            width={1000}
            className="p-4"
          />
        </div>
      </main>
    </>
  );
}
