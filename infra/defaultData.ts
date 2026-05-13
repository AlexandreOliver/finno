import { frequencyEnum, statusEnum, typesEnum } from "./database/schemas/Enums";
import bcrypt from "bcrypt";

const hoje = new Date();

function hash(senha: string) {
  const salt = bcrypt.genSaltSync(1);
  return bcrypt.hashSync(senha, salt);
}

const seed_users = [
  {
    id: "019e1d95-adc9-7d91-a837-cafff2aa8c04",
    firstName: "ulisses",
    lastName: "filho de laertes",
    email: "coroa@itaca.ageu",
    password: hash("rei-de-itaca"),
    features: ["demo"],
  },
];

const seed_wallets = [
  {
    id: "019e1dc7-df44-7810-afb6-5e56ac7becf1",
    labelName: "Patrimônio",
    ownerId: seed_users[0].id,
  },
  {
    id: "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
    labelName: "Principal",
    ownerId: seed_users[0].id,
  },
];

const seed_categorias = [
  {
    id: "019e1da3-47bc-7cca-8563-da7d117ac1e2",
    label: "Lanche",
    description: "comida no ifood ou outro app semelhante",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1da0-9c16-7398-860d-8029f22dd04c",
    label: "Energia",
    description: "Fatura de energia da concessionária",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1da5-dc9f-70e5-a692-89772875c085",
    label: "Compras",
    description: "Compras no geral, caso não haja Categoria especifica",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1da6-2987-7134-a0fa-e292b62e63cb",
    label: "Mercado",
    description: "Compras no Supermercado",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1dd8-ac1d-7c13-86b4-26552aadef87",
    label: "Beleza",
    description: "Compra de itens de Beleza",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1da6-67fe-7b33-84f3-b4ac46116ed3",
    label: "Empréstimo",
    description: "Dinheiro enviado para terceiro com expectativa de retorno",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1dab-48cc-770e-a639-c67a8880703f",
    label: "Saude",
    description: "Gastos com Remedios, Exames ou Produtos relacionados a Saude",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1dad-283b-7df5-935d-d400efa09f8e",
    label: "Transporte",
    description: "Gastos com Uber ou Onibus",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1dae-3250-7113-adba-1dafb7a8bcb5",
    label: "Investimento",
    description: "Dinheiro alçado para Investimentos diversos",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1db1-1cbd-7b89-ade4-d471fbe8072f",
    label: "Agua",
    description: "Fatura de Agua da Concessionária",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1db1-655e-7581-a6f8-ed74610050f3",
    label: "Internet",
    description: "Fatura de Energia da Concessionária",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1db2-1283-7323-9086-1c1a1a3185b1",
    label: "Assinaturas",
    description: "Assinaturas diversas em streaming",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1db5-e83b-7b56-857c-1b94181d95d3",
    label: "Faculdade",
    description: "Mensalidade da Faculdade",
    type: typesEnum.enumValues[0],
  },
  {
    id: "019e1d97-f1c6-7eee-bb29-18e289e7484f",
    label: "Salário",
    description: "Salário recebido mensalmente",
    type: typesEnum.enumValues[1],
  },
  {
    id: "019e1da0-389e-7ec5-8b87-0b877b11c4a4",
    label: "Rendimentos",
    description: "Lucros de investimento",
    type: typesEnum.enumValues[1],
  },
  {
    id: "019e1daf-f477-7faf-a514-a6627ac48356",
    label: "Devolução",
    description: "Retorno de um Empréstimo á terceiro",
    type: typesEnum.enumValues[1],
  },
  {
    id: "019e1dbc-ddff-7801-9a9c-a617cfd6ad15",
    label: "Aquisição de Empréstimo",
    description: "Empréstimo recebido sendo Bancário ou não",
    type: typesEnum.enumValues[1],
  },
  {
    id: "019e1dc3-e1d4-7978-98ec-88eb2c60037e",
    label: "Extra",
    description: "Ganhos oriundos de renda extra",
    type: typesEnum.enumValues[1],
  },
];

const seed_templateReccurent = [
  {
    id: "019e1e61-b1d6-701c-8483-c2b5ba46a932",
    type: typesEnum.enumValues[0],
    status: statusEnum.enumValues[0],
    description: "Iphone 12",
    amount: "120.43",
    frequency: frequencyEnum.enumValues[2],
    interval: 1,
    installments: 12,
    categoryId: seed_categorias[2].id,
    walletId: seed_wallets[1].id,
    start_date: new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      hoje.getDate(),
      hoje.getHours(),
    ),
    end_date: new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 11,
      hoje.getDate(),
      hoje.getHours(),
    ),
    next_due_date: new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      hoje.getDate(),
      hoje.getHours(),
    ),
  },
];

const seed_movements = [
  {
    id: "019e1dde-48e8-73b6-b0d4-bcaadd749216",
    type: typesEnum.enumValues[1],
    description: "Salário do mês",
    amount: "1843.23",
    categoryId: seed_categorias[13].id,
    walletId: seed_wallets[1].id,
    executedAt: new Date(),
  },
  {
    id: "019e1dff-0c81-7ea5-9ff2-582433246f3c",
    type: typesEnum.enumValues[0],
    description: "Mercado do mês",
    amount: "789.34",
    categoryId: seed_categorias[3].id,
    walletId: seed_wallets[1].id,
    executedAt: new Date(),
  },
  {
    id: "019e1e0d-21aa-773e-b3a7-9bfb6af6e80f",
    type: typesEnum.enumValues[0],
    description: "Conta de luz",
    amount: "102.40",
    categoryId: seed_categorias[1].id,
    walletId: seed_wallets[1].id,
    executedAt: new Date(),
  },
  {
    id: "019e1e52-de9d-77e1-8175-0f12d40a181d",
    type: typesEnum.enumValues[0],
    description: "Emprestado a Melenau",
    amount: "50.41",
    categoryId: seed_categorias[5].id,
    walletId: seed_wallets[1].id,
    executedAt: new Date(),
  },
  {
    id: "019e1e59-1daa-7586-8bf9-9537a3fe52e8",
    type: typesEnum.enumValues[0],
    description: "Parcela 01/12 - Iphone 12",
    amount: "120.43",
    categoryId: seed_categorias[2].id,
    walletId: seed_wallets[1].id,
    reccurentId: seed_templateReccurent[0].id,
    executedAt: new Date(),
  },
];

const seed_transfers = [
  {
    id: "019e1e03-e846-7cb5-b183-4d9c85984e61",
    debited_wallet: seed_wallets[1].id,
    credited_wallet: seed_wallets[0].id,
    amount: "300",
  },
];

export {
  seed_categorias,
  seed_users,
  seed_wallets,
  seed_movements,
  seed_transfers,
  seed_templateReccurent,
};
