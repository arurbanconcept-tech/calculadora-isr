// Motor de cálculo ISR — Enajenación de Inmuebles
// Base legal: Arts. 119–128, 152 LISR; Art. 93 fr. XIX inciso a) LISR
// Vigente para ejercicio fiscal 2026

import { obtenerINPC, mesPrevio } from './inpcData.js';
import { obtenerTramoTarifa } from './taxTables.js';
import { CONFIG } from '../constants/config.js';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Factor de Actualización — Art. 124 LISR
// ─────────────────────────────────────────────────────────────────────────────

export function calcularFactorActualizacion(mesAdquisicion, mesVenta) {
  // El Art. 124 especifica usar el INPC del mes inmediato anterior a la enajenación
  const claveVenta = mesPrevio(mesVenta);
  const inpcVenta = obtenerINPC(claveVenta) ?? obtenerINPC(mesVenta);
  const inpcAdquisicion = obtenerINPC(mesAdquisicion);

  if (!inpcVenta || !inpcAdquisicion) {
    throw new Error(
      `No se encontró el INPC para ${mesAdquisicion} o ${mesVenta}. ` +
      `Verifica que las fechas sean correctas.`
    );
  }

  return inpcVenta / inpcAdquisicion;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Años de tenencia
// ─────────────────────────────────────────────────────────────────────────────

export function calcularAniosTenencia(mesAdquisicion, mesVenta) {
  const [anioCompra, mesCompra] = mesAdquisicion.split('-').map(Number);
  const [anioVenta, mesVentaN] = mesVenta.split('-').map(Number);

  const anos = (anioVenta - anioCompra) + (mesVentaN >= mesCompra ? 0 : -1);
  return Math.max(1, anos);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Costo de construcción actualizado con depreciación — Art. 124 LISR
// ─────────────────────────────────────────────────────────────────────────────

export function calcularCostoConstruccionActualizado(costoOriginal, aniosTenencia, fa) {
  // 3% anual de depreciación, máximo 80% (el inmueble siempre vale al menos 20%)
  const pctDeprec = Math.min(CONFIG.TASA_DEPRECIACION_ANUAL * aniosTenencia, CONFIG.DEPRECIACION_MAXIMA);
  const costoDepreciado = costoOriginal * (1 - pctDeprec);
  return costoDepreciado * fa;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Costo de terreno actualizado (sin depreciación) — Art. 124 LISR
// ─────────────────────────────────────────────────────────────────────────────

export function calcularCostoTerrenoActualizado(costoTerreno, fa) {
  return costoTerreno * fa;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Separación terreno / construcción — criterio interpretativo SAT Art. 124
// ─────────────────────────────────────────────────────────────────────────────

export function separarTerrenoConstruccion(costoTotal, costoTerreno, costoConstruccion) {
  if (costoTerreno > 0 && costoConstruccion > 0) {
    return { terreno: costoTerreno, construccion: costoConstruccion };
  }
  return {
    terreno: costoTotal * CONFIG.PORCENTAJE_TERRENO_SUPLETORIO,
    construccion: costoTotal * CONFIG.PORCENTAJE_CONSTRUCCION_SUPLETORIA,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Costo mínimo — Art. 121 fr. I LISR
// ─────────────────────────────────────────────────────────────────────────────

export function aplicarCostoMinimo(costoActualizado, precioVenta) {
  const minimo = precioVenta * CONFIG.COSTO_MINIMO_PORCENTAJE;
  return Math.max(costoActualizado, minimo);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Actualizar deducción por INPC — Art. 121 fr. III y IV LISR
// ─────────────────────────────────────────────────────────────────────────────

export function actualizarDeduccion(monto, mesErogacion, mesVenta) {
  if (!monto || monto <= 0) return 0;
  try {
    const fa = calcularFactorActualizacion(mesErogacion, mesVenta);
    return monto * fa;
  } catch {
    return monto;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Exención casa habitación — Art. 93 fr. XIX inciso a) LISR
// ─────────────────────────────────────────────────────────────────────────────

export function calcularExencionCasaHabitacion(precioVenta, cumpleRequisitos, valorUDIS) {
  if (!cumpleRequisitos) {
    return {
      aplica: false,
      proporcionGravada: 1,
      montoExento: 0,
      montoGravado: precioVenta,
      mensaje: 'No cumple los requisitos de exención.',
    };
  }

  const limiteExento = valorUDIS; // 700,000 UDIS en pesos

  if (precioVenta <= limiteExento) {
    return {
      aplica: true,
      exentoTotal: true,
      proporcionGravada: 0,
      montoExento: precioVenta,
      montoGravado: 0,
      limiteExento,
      mensaje: `El precio está dentro del límite exento de ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(limiteExento)}.`,
    };
  }

  const excedente = precioVenta - limiteExento;
  const proporcionGravada = excedente / precioVenta;

  return {
    aplica: true,
    exentoTotal: false,
    proporcionGravada,
    montoExento: limiteExento,
    montoGravado: excedente,
    limiteExento,
    mensaje: `El excedente de ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(excedente)} (${(proporcionGravada * 100).toFixed(2)}%) está sujeto a ISR.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. División ganancia acumulable / no acumulable — Art. 120 LISR
// ─────────────────────────────────────────────────────────────────────────────

export function dividirGanancia(gananciaGravada, aniosTenencia) {
  const aniosCalculo = Math.min(aniosTenencia, CONFIG.ANOS_TENENCIA_MAXIMO);
  const acumulable = gananciaGravada / aniosCalculo;
  const noAcumulable = gananciaGravada - acumulable;
  return { acumulable, noAcumulable, aniosCalculo };
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Tarifa Art. 152 LISR
// ─────────────────────────────────────────────────────────────────────────────

export function aplicarTarifaArt152(baseGravable) {
  if (baseGravable <= 0) return 0;
  const tramo = obtenerTramoTarifa(baseGravable);
  const excedente = baseGravable - tramo.limiteInferior;
  return tramo.cuotaFija + excedente * (tramo.porcentaje / 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Pago provisional del Notario — Art. 126 LISR + ISR estatal Art. 127
// ─────────────────────────────────────────────────────────────────────────────

export function calcularPagoProvisionalNotario(gananciaGravada, aniosTenencia) {
  const { aniosCalculo } = dividirGanancia(gananciaGravada, aniosTenencia);

  // Ganancia proporcional al año
  const gananciaAnual = gananciaGravada / aniosCalculo;

  // ISR sobre la ganancia anualizada, multiplicado por años
  const isrAnual = aplicarTarifaArt152(gananciaAnual);
  const isrFederal = Math.round(isrAnual * aniosCalculo);

  // ISR estatal (Art. 127) — 5% sobre la ganancia gravada, acreditable contra federal
  const isrEstatal5pct = Math.round(gananciaGravada * CONFIG.TASA_ISR_ESTATAL);

  // El pago provisional es el mayor de los dos
  const pagoProvisional = Math.max(isrFederal, isrEstatal5pct);

  return {
    isrFederal,
    isrEstatal5pct,
    pagoProvisional,
    gananciaAnual: Math.round(gananciaAnual),
    isrAnual: Math.round(isrAnual),
    aniosCalculo,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN MAESTRA — calcularISRCompleto
// ─────────────────────────────────────────────────────────────────────────────

export function calcularISRCompleto(datos) {
  const {
    tipoInmueble,            // 'casa' | 'terreno'
    precioVenta,
    fechaAdquisicion,        // "YYYY-MM"
    fechaVenta,              // "YYYY-MM"
    costoAdquisicion,
    costoTerreno = 0,
    costoConstruccion = 0,
    costoMejoras = 0,
    fechaMejoras = null,
    gastosNotarialesCompra = 0,
    gastosNotarialesVenta = 0,
    comisionInmobiliaria = 0,  // porcentaje (ej: 5 para 5%)
    costoAvaluo = 0,
    esCasaHabitacion = false,
    noCasosPrevios3Anos = false,
    puedeAcreditarDomicilio = false,
  } = datos;

  const valorUDIS = CONFIG.UDIS_EXENTAS * CONFIG.VALOR_UDI_HOY;

  // ── Paso 0: Años de tenencia ──────────────────────────────────────────────
  const aniosTenencia = calcularAniosTenencia(fechaAdquisicion, fechaVenta);

  // ── Paso 1: Factor de actualización ──────────────────────────────────────
  let factorActualizacion;
  try {
    factorActualizacion = calcularFactorActualizacion(fechaAdquisicion, fechaVenta);
  } catch (err) {
    return { error: err.message };
  }

  // ── Paso 2: Costo de adquisición actualizado ──────────────────────────────
  let costoAdquisicionActualizado;
  let desgloseCosto = {};

  if (tipoInmueble === 'terreno') {
    costoAdquisicionActualizado = calcularCostoTerrenoActualizado(costoAdquisicion, factorActualizacion);
    desgloseCosto = {
      terreno: costoAdquisicionActualizado,
      construccion: 0,
      pctDepreciacion: 0,
    };
  } else {
    // Casa habitación: separar terreno y construcción
    const { terreno, construccion } = separarTerrenoConstruccion(
      costoAdquisicion, costoTerreno, costoConstruccion
    );
    const usaRegla8020 = !(costoTerreno > 0 && costoConstruccion > 0);
    const terrenoActualizado = calcularCostoTerrenoActualizado(terreno, factorActualizacion);
    const pctDepreciacion = Math.min(CONFIG.TASA_DEPRECIACION_ANUAL * aniosTenencia, CONFIG.DEPRECIACION_MAXIMA);
    const construccionActualizada = calcularCostoConstruccionActualizado(
      construccion, aniosTenencia, factorActualizacion
    );
    costoAdquisicionActualizado = terrenoActualizado + construccionActualizada;
    desgloseCosto = {
      terrenoOriginal: terreno,
      construccionOriginal: construccion,
      terrenoActualizado,
      construccionActualizada,
      pctDepreciacion,
      usaRegla8020,
    };
  }

  // Aplicar costo mínimo (Art. 121 fr. I)
  const costoSinMinimo = costoAdquisicionActualizado;
  costoAdquisicionActualizado = aplicarCostoMinimo(costoAdquisicionActualizado, precioVenta);
  const aplicoCostoMinimo = costoAdquisicionActualizado > costoSinMinimo;

  // ── Paso 3: Mejoras actualizadas ──────────────────────────────────────────
  let mejorasActualizadas = 0;
  let factorMejoras = 1;
  if (tipoInmueble === 'casa' && costoMejoras > 0) {
    const mesMejoras = fechaMejoras || fechaAdquisicion;
    mejorasActualizadas = actualizarDeduccion(costoMejoras, mesMejoras, fechaVenta);
    try { factorMejoras = calcularFactorActualizacion(mesMejoras, fechaVenta); } catch { /**/ }
  }

  // ── Paso 4: Otras deducciones actualizadas ────────────────────────────────
  const gastosNotarialesCompraActualizados = actualizarDeduccion(
    gastosNotarialesCompra, fechaAdquisicion, fechaVenta
  );
  // Gastos de venta y comisiones son del presente → no se actualizan
  const comisionMonto = (precioVenta * comisionInmobiliaria) / 100;
  const gastosVenta = gastosNotarialesVenta || 0;
  const avaluo = costoAvaluo || 0;

  // ── Paso 5: Ganancia total ────────────────────────────────────────────────
  const totalDeducciones =
    costoAdquisicionActualizado +
    mejorasActualizadas +
    gastosNotarialesCompraActualizados +
    gastosVenta +
    comisionMonto +
    avaluo;

  const gananciaTotal = precioVenta - totalDeducciones;

  // ── Paso 6: Pérdida fiscal ────────────────────────────────────────────────
  if (gananciaTotal <= 0) {
    return {
      resultado: 'perdida',
      precioVenta,
      totalDeducciones: Math.round(totalDeducciones),
      gananciaTotal: Math.round(gananciaTotal),
      isrFederalEstimado: 0,
      isrEstatalEstimado: 0,
      pagoProvisionalNotario: 0,
      factorActualizacion: +factorActualizacion.toFixed(4),
      aniosTenencia,
      desgloseCosto,
      desgloseDeducciones: {
        costoAdquisicionActualizado: Math.round(costoAdquisicionActualizado),
        mejorasActualizadas: Math.round(mejorasActualizadas),
        gastosNotarialesCompraActualizados: Math.round(gastosNotarialesCompraActualizados),
        gastosVenta: Math.round(gastosVenta),
        comisionMonto: Math.round(comisionMonto),
        avaluo: Math.round(avaluo),
      },
      aplicoCostoMinimo,
      mensaje: 'No hay ISR a pagar. La operación genera una pérdida fiscal que puede reportarse en la declaración anual (Art. 122 LISR).',
    };
  }

  // ── Paso 7: Exención casa habitación ─────────────────────────────────────
  let exencionInfo = null;
  let gananciaGravada = gananciaTotal;

  if (tipoInmueble === 'casa') {
    const cumpleRequisitos = esCasaHabitacion && noCasosPrevios3Anos && puedeAcreditarDomicilio;
    exencionInfo = calcularExencionCasaHabitacion(precioVenta, cumpleRequisitos, valorUDIS);
    gananciaGravada = gananciaTotal * exencionInfo.proporcionGravada;
  }

  // ── Paso 8: Exento total ──────────────────────────────────────────────────
  if (gananciaGravada <= 0) {
    return {
      resultado: 'exento',
      precioVenta,
      totalDeducciones: Math.round(totalDeducciones),
      gananciaTotal: Math.round(gananciaTotal),
      gananciaGravada: 0,
      isrFederalEstimado: 0,
      isrEstatalEstimado: 0,
      pagoProvisionalNotario: 0,
      factorActualizacion: +factorActualizacion.toFixed(4),
      aniosTenencia,
      exencionInfo,
      desgloseCosto,
      desgloseDeducciones: {
        costoAdquisicionActualizado: Math.round(costoAdquisicionActualizado),
        mejorasActualizadas: Math.round(mejorasActualizadas),
        gastosNotarialesCompraActualizados: Math.round(gastosNotarialesCompraActualizados),
        gastosVenta: Math.round(gastosVenta),
        comisionMonto: Math.round(comisionMonto),
        avaluo: Math.round(avaluo),
      },
      aplicoCostoMinimo,
      mensaje: '¡Esta venta podría estar exenta de ISR! Confirma los requisitos con tu Notario.',
    };
  }

  // ── Paso 9: División ganancia + tarifa + pago provisional ─────────────────
  const { acumulable, noAcumulable, aniosCalculo } = dividirGanancia(gananciaGravada, aniosTenencia);
  const pagoProvisional = calcularPagoProvisionalNotario(gananciaGravada, aniosTenencia);

  return {
    resultado: 'gravado',
    precioVenta,
    totalDeducciones: Math.round(totalDeducciones),
    gananciaTotal: Math.round(gananciaTotal),
    gananciaGravada: Math.round(gananciaGravada),
    gananciaAcumulable: Math.round(acumulable),
    gananciaNoAcumulable: Math.round(noAcumulable),
    isrFederalEstimado: pagoProvisional.isrFederal,
    isrEstatalEstimado: pagoProvisional.isrEstatal5pct,
    pagoProvisionalNotario: pagoProvisional.pagoProvisional,
    gananciaAnualizada: pagoProvisional.gananciaAnual,
    isrSobreAnualizada: pagoProvisional.isrAnual,
    factorActualizacion: +factorActualizacion.toFixed(4),
    factorMejoras: fechaMejoras ? +factorMejoras.toFixed(4) : null,
    aniosTenencia,
    aniosCalculo,
    exencionInfo,
    desgloseCosto,
    aplicoCostoMinimo,
    desgloseDeducciones: {
      costoAdquisicionActualizado: Math.round(costoAdquisicionActualizado),
      mejorasActualizadas: Math.round(mejorasActualizadas),
      gastosNotarialesCompraActualizados: Math.round(gastosNotarialesCompraActualizados),
      gastosVenta: Math.round(gastosVenta),
      comisionMonto: Math.round(comisionMonto),
      avaluo: Math.round(avaluo),
    },
    advertencia: 'Este es un ESTIMADO orientativo. El ISR definitivo se calcula en la declaración anual de abril, incorporando todos los ingresos y deducciones del ejercicio.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Datos de ejemplo para el botón "Ver ejemplo"
// ─────────────────────────────────────────────────────────────────────────────

export const EJEMPLO_CASA = {
  tipoInmueble: 'casa',
  precioVenta: 8_000_000,
  fechaAdquisicion: '2010-03',
  fechaVenta: '2026-04',
  costoAdquisicion: 1_500_000,
  costoTerreno: 300_000,
  costoConstruccion: 1_200_000,
  costoMejoras: 0,
  fechaMejoras: null,
  gastosNotarialesCompra: 90_000,
  gastosNotarialesVenta: 80_000,
  comisionInmobiliaria: 5,
  costoAvaluo: 5_000,
  esCasaHabitacion: true,
  noCasosPrevios3Anos: true,
  puedeAcreditarDomicilio: true,
};

export const EJEMPLO_TERRENO = {
  tipoInmueble: 'terreno',
  precioVenta: 3_500_000,
  fechaAdquisicion: '2018-06',
  fechaVenta: '2026-04',
  costoAdquisicion: 1_800_000,
  costoTerreno: 0,
  costoConstruccion: 0,
  costoMejoras: 0,
  fechaMejoras: null,
  gastosNotarialesCompra: 50_000,
  gastosNotarialesVenta: 60_000,
  comisionInmobiliaria: 5,
  costoAvaluo: 4_000,
  esCasaHabitacion: false,
  noCasosPrevios3Anos: false,
  puedeAcreditarDomicilio: false,
};
