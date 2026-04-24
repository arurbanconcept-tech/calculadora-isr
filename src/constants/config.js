// Constantes globales de la calculadora ISR
// Actualizar VALOR_UDI_HOY mensualmente con el valor oficial de Banxico

export const CONFIG = {
  // Exención casa habitación — Art. 93 fr. XIX inciso a) LISR
  UDIS_EXENTAS: 700_000,

  // Valor UDI al 24 de abril de 2026 (actualizar mensualmente)
  // Fuente: https://www.banxico.org.mx
  VALOR_UDI_HOY: 8.29,
  FECHA_UDI: '24 de abril de 2026',

  get LIMITE_EXENCION_PESOS() {
    return this.UDIS_EXENTAS * this.VALOR_UDI_HOY;
  },

  // Depreciación construcción — Art. 124 LISR
  TASA_DEPRECIACION_ANUAL: 0.03,
  DEPRECIACION_MAXIMA: 0.80,       // Máximo 80% depreciado → mínimo 20% del costo original

  // Costo mínimo — Art. 121 fr. I LISR
  COSTO_MINIMO_PORCENTAJE: 0.10,   // Mínimo 10% del precio de venta

  // División de ganancia — Art. 120 LISR
  ANOS_TENENCIA_MAXIMO: 20,

  // ISR estatal — Art. 127 LISR
  TASA_ISR_ESTATAL: 0.05,

  // Separación terreno/construcción (regla supletoria)
  PORCENTAJE_TERRENO_SUPLETORIO: 0.20,
  PORCENTAJE_CONSTRUCCION_SUPLETORIA: 0.80,

  // Vigencia de la tarifa
  ANIO_TARIFA: 2026,
  FUENTE_TARIFA: 'Anexo 8 RMF 2026 (DOF 28-Dic-2025)',
};

export const DISCLAIMER = `Este resultado es una ESTIMACIÓN ORIENTATIVA basada en los datos proporcionados y las fórmulas de la LISR vigente. El ISR definitivo se determina en la declaración anual de abril e incorpora todos los ingresos y deducciones del ejercicio fiscal. Para una opinión fiscal vinculante, consulta a un contador público certificado o al Notario que formalice la operación.`;
