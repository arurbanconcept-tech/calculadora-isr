import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatFactor, formatMesAnio } from '../utils/formatters.js';
import { CONFIG } from '../constants/config.js';

function Row({ label, valor, signo, highlight, indent }) {
  return (
    <div className={`desglose-row ${highlight ? 'subtotal' : ''} ${indent ? 'pl-4' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold' : 'text-muted'}`}>
        {signo && <span className={signo === '−' ? 'text-danger mr-1' : 'text-success mr-1'}>{signo}</span>}
        {label}
      </span>
      <span className={`text-sm font-mono tabular-nums ${
        highlight ? 'font-semibold' : ''
      } ${signo === '−' ? 'text-danger' : ''}`}>
        {valor}
      </span>
    </div>
  );
}

export default function FormulaBreakdown({ resultado, datos }) {
  const [expanded, setExpanded] = useState(true);
  if (!resultado || resultado.resultado === undefined) return null;

  const { desgloseDeducciones: d, desgloseCosto: c } = resultado;

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="font-display text-lg font-semibold text-primary">
          📋 Desglose del cálculo paso a paso
        </h3>
        {expanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-6 text-sm">
          {/* ── Paso 1: Factor de actualización ── */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Paso 1 — Factor de Actualización (Art. 124 LISR)
            </p>
            <div className="bg-bg rounded-sm p-3 text-xs font-mono space-y-1">
              <p>INPC {formatMesAnio(datos.fechaVenta)} (anterior) ÷ INPC {formatMesAnio(datos.fechaAdquisicion)}</p>
              <p className="text-primary font-bold">= {formatFactor(resultado.factorActualizacion)}</p>
            </div>
          </div>

          {/* ── Paso 2: Costo de adquisición actualizado ── */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Paso 2 — Costo de Adquisición Actualizado
            </p>
            {datos.tipoInmueble === 'casa' && c ? (
              <div className="space-y-1">
                {c.usaRegla8020 && (
                  <p className="text-xs text-amber-600 mb-2">
                    ℹ️ Se aplicó la regla 80/20 (terreno 20% / construcción 80%) al no especificar desglose.
                  </p>
                )}
                <Row label={`Terreno original (${formatCurrency(c.terrenoOriginal)}) × ${formatFactor(resultado.factorActualizacion)}`}
                     valor={formatCurrency(c.terrenoActualizado)} indent />
                <Row
                  label={`Construcción original (${formatCurrency(c.construccionOriginal)}) × (1 − ${(c.pctDepreciacion * 100).toFixed(0)}% deprec.) × ${formatFactor(resultado.factorActualizacion)}`}
                  valor={formatCurrency(c.construccionActualizada)}
                  indent
                />
              </div>
            ) : (
              <Row
                label={`Costo compra × Factor ${formatFactor(resultado.factorActualizacion)}`}
                valor={formatCurrency(d?.costoAdquisicionActualizado)}
              />
            )}
            {resultado.aplicoCostoMinimo && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Se aplicó el costo mínimo del 10% del precio de venta (Art. 121 fr. I LISR).
              </p>
            )}
          </div>

          {/* ── Paso 3 y 4: Deducciones ── */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Pasos 3–4 — Total de Deducciones Autorizadas (Art. 121 LISR)
            </p>
            <Row label="Costo de adquisición actualizado" valor={formatCurrency(d?.costoAdquisicionActualizado)} />
            {d?.mejorasActualizadas > 0 && (
              <Row label={`Mejoras actualizadas (× ${formatFactor(resultado.factorMejoras)})`}
                   valor={formatCurrency(d.mejorasActualizadas)} />
            )}
            {d?.gastosNotarialesCompraActualizados > 0 && (
              <Row label="Gastos notariales compra (actualizados)" valor={formatCurrency(d.gastosNotarialesCompraActualizados)} />
            )}
            {d?.gastosVenta > 0 && (
              <Row label="Gastos notariales venta" valor={formatCurrency(d.gastosVenta)} />
            )}
            {d?.comisionMonto > 0 && (
              <Row label={`Comisión inmobiliaria (${datos.comisionInmobiliaria}%)`} valor={formatCurrency(d.comisionMonto)} />
            )}
            {d?.avaluo > 0 && (
              <Row label="Costo del avalúo" valor={formatCurrency(d.avaluo)} />
            )}
            <Row label="TOTAL DEDUCCIONES" valor={formatCurrency(resultado.totalDeducciones)} highlight />
          </div>

          {/* ── Ganancia total ── */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Paso 5 — Ganancia Total (Art. 121 LISR)
            </p>
            <Row label="Precio de venta" valor={formatCurrency(resultado.precioVenta)} />
            <Row label="Total deducciones" valor={formatCurrency(resultado.totalDeducciones)} signo="−" />
            <Row label="GANANCIA TOTAL" valor={formatCurrency(resultado.gananciaTotal)} highlight />
          </div>

          {/* ── Exención ── */}
          {resultado.exencionInfo && resultado.exencionInfo.aplica && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Paso 6 — Exención Casa Habitación (Art. 93 fr. XIX inciso a) LISR)
              </p>
              <Row label="Límite exento (700,000 UDIS)" valor={formatCurrency(resultado.exencionInfo.limiteExento)} />
              {!resultado.exencionInfo.exentoTotal && (
                <>
                  <Row label="Excedente del precio" valor={formatCurrency(resultado.exencionInfo.montoGravado)} signo="−" />
                  <Row
                    label={`Proporción gravada (${(resultado.exencionInfo.proporcionGravada * 100).toFixed(2)}%)`}
                    valor={formatCurrency(resultado.gananciaGravada)}
                    highlight
                  />
                  <p className="text-xs text-muted mt-1">
                    Ganancia gravada = Ganancia total × {(resultado.exencionInfo.proporcionGravada * 100).toFixed(2)}%
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Cálculo ISR ── */}
          {resultado.resultado === 'gravado' && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Pasos 7–9 — Cálculo del ISR (Art. 126 LISR)
              </p>
              <Row label="Ganancia gravable" valor={formatCurrency(resultado.gananciaGravada)} />
              <Row label={`÷ Años de tenencia (máx. 20) = ${resultado.aniosCalculo} años`}
                   valor={formatCurrency(resultado.gananciaAnualizada)} />
              <Row label="ISR sobre ganancia anualizada (tarifa Art. 152)"
                   valor={formatCurrency(resultado.isrSobreAnualizada)} />
              <Row label={`× ${resultado.aniosCalculo} años = ISR Federal`}
                   valor={formatCurrency(resultado.isrFederalEstimado)} />
              <Row label="ISR Estatal 5% (Art. 127 LISR)"
                   valor={formatCurrency(resultado.isrEstatalEstimado)} />
              <div className="desglose-row total">
                <span className="font-bold">PAGO PROVISIONAL NOTARIO (mayor de los dos)</span>
                <span className="font-bold font-mono">{formatCurrency(resultado.pagoProvisionalNotario)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
