import { BarChart3, Shield, Wallet } from "lucide-react";

export function InfoCards() {
  return (
    <section className="px-6 py-20 md:px-14 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <h2
          className="
            text-2xl text-section-heading text-center
            font-medium tracking-tight-section  
            mb-16"
        >
          Recursos principais
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-popover rounded-sm p-8 shadow-md hover:shadow-elevated transition-shadow">
            <Wallet className="w-8 h-8 text-stripe-purple mb-6" />
            <h3 className="text-sub-heading font-medium leading-tight-sub tracking-tight-small mb-4">
              Controle de Gastos
            </h3>
            <p className="text-body font-normal leading-normal">
              Categorize e monitore todos os seus gastos em tempo real, com
              relatórios detalhados e insights valiosos.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-popover rounded-sm p-8 shadow-md hover:shadow-stripe-elevated transition-shadow">
            <BarChart3 className="w-8 h-8 text-stripe-purple mb-6" />
            <h3 className="text-sub-heading font-medium leading-tight-sub tracking-tight-small mb-4">
              Análises Avançadas
            </h3>
            <p className="text-body font-normal leading-normal">
              Visualize seus dados financeiros com gráficos interativos
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-popover rounded-sm p-8 shadow-md hover:shadow-stripe-elevated transition-shadow">
            <Shield className="w-8 h-8 text-stripe-purple mb-6" />
            <h3 className="text-sub-heading font-medium leading-tight-sub tracking-tight-small mb-4">
              Segurança Total
            </h3>
            <p className="text-body font-normal leading-normal">
              Seus dados são protegidos com criptografia de ponta e conformidade
              com as melhores práticas de segurança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
