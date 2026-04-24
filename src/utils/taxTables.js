// Tarifa Art. 152 LISR — Anexo 8 RMF 2026 (DOF 28-Dic-2025)
// Actualizar cada enero con el nuevo Anexo 8

export const TARIFA_ISR_ANUAL = [
  { limiteInferior: 0.01,        limiteSuperior: 10_135.11,    cuotaFija: 0,           porcentaje: 1.92  },
  { limiteInferior: 10_135.12,   limiteSuperior: 86_022.11,    cuotaFija: 194.59,      porcentaje: 6.40  },
  { limiteInferior: 86_022.12,   limiteSuperior: 151_176.19,   cuotaFija: 5_051.37,    porcentaje: 10.88 },
  { limiteInferior: 151_176.20,  limiteSuperior: 175_735.66,   cuotaFija: 12_140.13,   porcentaje: 16.00 },
  { limiteInferior: 175_735.67,  limiteSuperior: 210_403.69,   cuotaFija: 16_069.64,   porcentaje: 17.92 },
  { limiteInferior: 210_403.70,  limiteSuperior: 424_353.97,   cuotaFija: 22_282.14,   porcentaje: 21.36 },
  { limiteInferior: 424_353.98,  limiteSuperior: 668_840.14,   cuotaFija: 67_981.92,   porcentaje: 23.52 },
  { limiteInferior: 668_840.15,  limiteSuperior: 955_036.77,   cuotaFija: 125_485.63,  porcentaje: 30.00 },
  { limiteInferior: 955_036.78,  limiteSuperior: 1_273_381.79, cuotaFija: 211_264.22,  porcentaje: 32.00 },
  { limiteInferior: 1_273_381.80,limiteSuperior: 3_820_145.72, cuotaFija: 313_056.90,  porcentaje: 34.00 },
  { limiteInferior: 3_820_145.73,limiteSuperior: Infinity,     cuotaFija: 1_178_958.79,porcentaje: 35.00 },
];

export function obtenerTramoTarifa(baseGravable) {
  return TARIFA_ISR_ANUAL.find(
    t => baseGravable >= t.limiteInferior && baseGravable <= t.limiteSuperior
  ) ?? TARIFA_ISR_ANUAL.at(-1);
}
