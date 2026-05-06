import { HeaderHome } from "@/features/home/components/HeaderHome";
import { Wallet, TrendingUp, Shield, BarChart3, Coins } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeaderHome />
      <main className="min-h-screen bg-pure-white">
        {/* Hero Section */}
        <section className="px-6 py-20 md:px-14 md:py-32 lg:px-20">
          <div className=" max-w-4xl mx-auto text-center items-center">
            <div className="flex justify-center">
              <Coins color="orange" size="120" className="mb-7.5" />
            </div>
            <h1 className="text-display-large text-lg font-normal text-deep-navy leading-tight-large tracking-tight-large mb-6">
              Gerencie seus gastos financeiros com precisão
            </h1>
            <p className="text-body-large font-normal text-md leading-normal mb-10 max-w-2xl mx-auto">
              A Finno é uma plataforma completa para gestão financeira pessoal,
              oferecendo insights profundos e controle total sobre seus gastos.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                href="/auth/signin"
                className="bg-[#533afd] hover:bg-[#4434d4] text-white px-6 py-3 rounded-sm font-normal text-button transition-colors inline-flex items-center justify-center gap-2"
              >
                Começar agora
                <TrendingUp className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className=" border border-[#b9b9f9] text-[#533afd] dark:text-white hover:bg-[#9e9ef5] px-6 py-3 rounded-sm font-normal text-button transition-colors inline-flex items-center justify-center"
                title="Entre em uma conta de teste e visualize a aplicação"
              >
                Ver demonstração
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 md:px-14 lg:px-20 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl text-section-heading font-medium text-deep-navy leading-tight-section tracking-tight-section text-center mb-16">
              Recursos principais
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-popover border border-[#e5edf5] rounded-[5px] p-8 shadow-sm hover:shadow-stripe-elevated transition-shadow">
                <Wallet className="w-8 h-8 text-stripe-purple mb-6" />
                <h3 className="text-sub-heading font-normal text-deep-navy leading-tight-sub tracking-tight-small mb-4">
                  Controle de Gastos
                </h3>
                <p className="text-body font-normal leading-normal">
                  Categorize e monitore todos os seus gastos em tempo real, com
                  relatórios detalhados e insights valiosos.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-popover border border-[#e5edf5] rounded-[5px] p-8 shadow-sm hover:shadow-stripe-elevated transition-shadow">
                <BarChart3 className="w-8 h-8 text-stripe-purple mb-6" />
                <h3 className="text-sub-heading font-normal text-deep-navy leading-tight-sub tracking-tight-small mb-4">
                  Análises Avançadas
                </h3>
                <p className="text-body font-normal leading-normal">
                  Visualize seus dados financeiros com gráficos interativos e
                  previsões baseadas em IA.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-popover border border-[#e5edf5] rounded-comfortable p-8 shadow-sm hover:shadow-stripe-elevated transition-shadow">
                <Shield className="w-8 h-8 text-stripe-purple mb-6" />
                <h3 className="text-sub-heading font-normal text-deep-navy leading-tight-sub tracking-tight-small mb-4">
                  Segurança Total
                </h3>
                <p className="text-body font-normal leading-normal">
                  Seus dados são protegidos com criptografia de ponta e
                  conformidade com as melhores práticas de segurança.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 md:px-14 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-section-heading font-light text-deep-navy leading-tight-section tracking-tight-section mb-6">
              Pronto para transformar sua gestão financeira?
            </h2>
            <p className="text-body-large font-light text-body leading-normal mb-10">
              Junte-se a milhares de usuários que já confiam na Finno para
              controlar seus gastos.
            </p>
            <Link
              href="/login"
              className="bg-[#533afd] hover:bg-[#4434d4] text-white px-8 py-4 rounded-sm font-normal text-button transition-colors inline-flex items-center justify-center gap-2"
            >
              Criar conta gratuita
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
