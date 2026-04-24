import { RotateCcw, Printer, TrendingDown, CheckCircle, Zap, DollarSign, Home, Trees, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatMesAnio } from '../utils/formatters.js';
import FormulaBreakdown from './FormulaBreakdown.jsx';
import DisclaimerBanner from './DisclaimerBanner.jsx';
import { CONFIG } from '../constants/config.js';

function ResultCard({ resultado }) {
  const cards = {
    perdida: {
      icon: TrendingDown,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      titulo: '📉 Pérdida fiscal',
      subtitulo: 'No hay ISR a pagar',
      descripcion: 'Vendiste el inmueble por menos de lo que costó (considerando inflación y deducciones). Puedes reportar esta pérdida en tu declaración anual (Art. 122 LISR).',
      isrLabel: 'ISR estimado',
      isrValor: '$0',
    },
    exento: {
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-success',
      badge: 'bg-green-100 text-green-700',
      titulo: '✅ ¡Posiblemente exento!',
      subtitulo: 'ISR = $0 (sujeto a verificación del Notario)',
      descripcion: `La venta podría estar exenta de ISR por estar dentro del límite de 700,000 UDIS (${formatCurrency(CONFIG.LIMITE_EXENCION_PESOS)}). El Notario confirmará los requisitos formales.`,
      isrLabel: 'ISR estimado',
      isrValor: '$0',
    },
    gravado: null,
  };

  if (resultado.resultado === 'gravado') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-sm">
            <DollarSign size={28} className="text-danger" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-red-100 text-danger text-xs font-semibold px-2 py-0.5 rounded-full">
                ISR ESTIMADO
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-danger mb-1">
              {formatCurrency(resultado.pagoProvisionalNotario)}
            </h2>
            <p className="text-sm text-red-700 mb-4">Pago provisional estimado a retener por el Notario</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/70 rounded-sm p-3 border border-red-100">
                <p className="text-xs text-muted mb-1">ISR Federal (Art. 126)</p>
                <p className="font-bold text-text">{formatCurrency(resultado.isrFederalEstimado)}</p>
              </div>
              <div className="bg-white/70 rounded-sm p-3 border border-red-100">
                <p className="text-xs text-muted mb-1">ISR Estatal 5% (Art. 127)</p>
                <p className="font-bold text-text">{formatCurrency(resultado.isrEstatalEstimado)}</p>
              </div>
              <div className="bg-white/70 rounded-sm p-3 border border-red-100">
                <p className="text-xs text-muted mb-1">Ganancia gravable</p>
                <p className="font-bold text-text">{formatCurrency(resultado.gananciaGravada)}</p>
              </div>
              <div className="bg-white/70 rounded-sm p-3 border border-red-100">
                <p className="text-xs text-muted mb-1">Años de tenencia</p>
                <p className="font-bold text-text">{resultado.aniosTenencia} años</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[resultado.resultado];
  if (!card) return null;
  const Icon = card.icon;

  return (
    <div className={`border rounded-md p-6 ${card.color}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/60 rounded-sm">
          <Icon size={28} className={card.iconColor} />
        </div>
        <div className="flex-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge} mb-2 inline-block`}>
            {card.isrLabel}: {card.isrValor}
          </span>
          <h2 className="font-display text-2xl font-bold text-primary mb-1">{card.titulo}</h2>
          <p className="text-sm text-primary font-medium mb-2">{card.subtitulo}</p>
          <p className="text-xs text-muted leading-relaxed">{card.descripcion}</p>

          {resultado.gananciaTotal && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/70 rounded-sm p-2 border border-white">
                <p className="text-muted">Precio de venta</p>
                <p className="font-bold">{formatCurrency(resultado.precioVenta)}</p>
              </div>
              <div className="bg-white/70 rounded-sm p-2 border border-white">
                <p className="text-muted">Ganancia contable</p>
                <p className="font-bold">{formatCurrency(resultado.gananciaTotal)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResumenOperacion({ datos, resultado }) {
  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold text-primary mb-4">📊 Resumen de la operación</h3>
      <div className="space-y-1">
        <div className="desglose-row">
          <span className="text-muted">Tipo de inmueble</span>
          <span className="font-medium flex items-center gap-1">
            {datos.tipoInmueble === 'casa' ? <><Home size={14} /> Casa habitación</> : <><Trees size={14} /> Terreno</>}
          </span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Fecha de compra</span>
          <span className="font-medium">{formatMesAnio(datos.fechaAdquisicion)}</span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Fecha de venta</span>
          <span className="font-medium">{formatMesAnio(datos.fechaVenta)}</span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Años de tenencia</span>
          <span className="font-medium">{resultado.aniosTenencia} años</span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Factor de actualización INPC</span>
          <span className="font-medium font-mono">{resultado.factorActualizacion}</span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Precio de venta</span>
          <span className="font-semibold text-primary">{formatCurrency(resultado.precioVenta)}</span>
        </div>
        <div className="desglose-row">
          <span className="text-muted">Total deducciones</span>
          <span className="font-semibold text-danger">{formatCurrency(resultado.totalDeducciones)}</span>
        </div>
        <div className="desglose-row subtotal">
          <span>Ganancia total</span>
          <span>{formatCurrency(resultado.gananciaTotal)}</span>
        </div>
        {resultado.exencionInfo?.aplica && resultado.exencionInfo?.montoExento > 0 && (
          <div className="desglose-row">
            <span className="text-muted">Monto exento (700k UDIS)</span>
            <span className="text-success font-medium">−{formatCurrency(resultado.exencionInfo.montoExento)}</span>
          </div>
        )}
        {resultado.gananciaGravada !== undefined && (
          <div className="desglose-row total">
            <span>Ganancia gravable</span>
            <span>{formatCurrency(resultado.gananciaGravada || 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Step4_Results({ resultado, datos, onReset }) {
  if (resultado.error) {
    return (
      <div className="card border border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0" />
          <div>
            <h3 className="font-semibold text-danger mb-1">Error en el cálculo</h3>
            <p className="text-sm text-muted">{resultado.error}</p>
            <button onClick={onReset} className="btn-secondary mt-3 text-sm">
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between no-print">
        <h2 className="section-title">Resultado estimado</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary text-xs py-2 px-3"
          >
            <Printer size={14} /> Imprimir
          </button>
          <button type="button" onClick={onReset} className="btn-secondary text-xs py-2 px-3">
            <RotateCcw size={14} /> Nuevo cálculo
          </button>
        </div>
      </div>

      {/* Card de resultado principal */}
      <ResultCard resultado={resultado} />

      {/* Resumen de operación */}
      <ResumenOperacion datos={datos} resultado={resultado} />

      {/* Desglose paso a paso */}
      <FormulaBreakdown resultado={resultado} datos={datos} />

      {/* Disclaimer completo */}
      <DisclaimerBanner />

      <button type="button" onClick={onReset} className="btn-secondary w-full no-print">
        <RotateCcw size={16} /> Realizar otro cálculo
      </button>
    </div>
  );
}
