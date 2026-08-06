export const usePercentLabel =
  () =>
  (inicial: number, final: number): { value: number; label: string } => {
    const variacao = (final - inicial) / Math.abs(inicial);
    const percVariacao = variacao * 100;
    const absPerc = Math.abs(variacao);

    let label;
    if (absPerc < 1) {
      label = Math.abs(Math.trunc(percVariacao)).toString() + "%";
    } else if (absPerc >= 1 && absPerc < 2) {
      label = "+2x";
    } else if (absPerc >= 2 && absPerc < 3) {
      label = "+3x";
    } else {
      label = "+4x";
    }

    return { value: percVariacao, label };
  };
