## Lógica de Cálculo do Snapshot

Para cada carteira:

- opening_balance: Busca o closing_balance do mês anterior. Se for o primeiro mês da carteira, o valor é zero.

- total_incomes: SUM(amount) de todas as transações de crédito do mês atual.

- total_expenses: SUM(amount) de todas as transações de débito do mês atual.

- closing_balance: Armazena o resultado da equação final.
