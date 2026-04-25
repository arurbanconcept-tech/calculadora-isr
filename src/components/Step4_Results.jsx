import { useState } from 'react';
import { RotateCcw, Printer, TrendingDown, CheckCircle, DollarSign, Home, Trees, AlertTriangle, Share2, Copy, Check } from 'lucide-react';
import { formatCurrency, formatMesAnio } from '../utils/formatters.js';
import FormulaBreakdown from './FormulaBreakdown.jsx';
import DisclaimerBanner from './DisclaimerBanner.jsx';
import { CONFIG } from '../constants/config.js';

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Calculadora ISR Inmobiliaria',
          text: 'Calcula el impuesto que pagarás al vender tu inmueble en México',
          url,
        });
        return;
      } catch (_) {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-secondary text-xs py-2 px-3 no-print"
    >
      {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
      {copied ? 'Link copiado' : 'Compartir'}
    </button>
  );
}

function ResultCard({ resultado }) {
  if (resultado.resultado === 'gravado') {
    const neto = resultado.precioVenta - resultado.pagoProvisionalNotario;

    return (
      <div className="space-y-3">
        {/* Hero — ISR a pagar */}
        <div className="bg-danger border-2 border-danger rounded-md p-6 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">
            Impuesto a pagar al vender
          </p>
          <p className="font-display text-6xl font-bold mb-2 leading-none">
            {formatCurrency(resultado.pagoProvisionalNotario)}
          </p>
          <p className="text-sm opacity-80">
            Pago provisional retenido por el Notario (Art. 126 LISR)
          </p>
        </div>

        {/* Precio → ISR → Neto */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-border rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">Precio de venta</p>
            <p className="font-bold text-sm">{formatCurrency(resultado.precioVenta)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">ISR estimado</p>
            <p className="font-bold text-sm text-danger">−{formatCurrency(resultado.pagoProvisionalNotario)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">Lo que recibes</p>
            <p className="font-bold text-sm text-success">{formatCurrency(neto)}</p>
          </div>
        </div>

        {/* Detalle */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white border border-border rounded-sm p-3">
            <p className="text-xs text-muted mb-1">ISR Federal (Art. 126)</p>
            <p className="font-bold">{formatCurrency(resultado.isrFederalEstimado)}</p>
          </div>
          <div className="bg-white border border-border rounded-sm p-3">
            <p className="text-xs text-muted mb-1">ISR Estatal 5% (Art. 127)</p>
            <p className="font-bold">{formatCurrency(resultado.isrEstatalEstimado)}</p>
          </div>
          <div className="bg-white border border-border rounded-sm p-3">
            <p className="text-xs text-muted mb-1">Ganancia gravable</p>
            <p className="font-bold">{formatCurrency(resultado.gananciaGravada)}</p>
          </div>
          <div className="bg-white border border-border rounded-sm p-3">
            <p className="text-xs text-muted mb-1">Años de tenencia</p>
            <p className="font-bold">{resultado.aniosTenencia} años</p>
          </div>
        </div>
      </div>
    );
  }

  if (resultado.resultado === 'exento') {
    return (
      <div className="space-y-3">
        <div className="bg-success border-2 border-success rounded-md p-6 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">
            ¡Posiblemente exento de ISR!
          </p>
          <p className="font-display text-6xl font-bold mb-2 leading-none">$0</p>
          <p className="text-sm opacity-80">
            Dentro del límite de 700,000 UDIS — el Notario confirmará los requisitos
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-border rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">Precio de venta</p>
            <p className="font-bold text-sm">{formatCurrency(resultado.precioVenta)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">ISR estimado</p>
            <p className="font-bold text-sm text-success">$0</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-center">
            <p className="text-xs text-muted mb-1">Lo que recibes</p>
            <p className="font-bold text-sm text-success">{formatCurrency(resultado.precioVenta)}</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-sm p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">✅ ¿Por qué aplica la exención?</p>
          <p className="text-xs">
            Tu ganancia está dentro del límite de {formatCurrency(CONFIG.LIMITE_EXENCION_PESOS)} (700,000 UDIS × ${CONFIG.VALOR_UDI_HOY} valor UDI).
            Declaraste ser casa habitación, sin casos previos en los últimos 3 años y puedes acreditar domicilio.
          </p>
        </div>
      </div>
    );
  }

  if (resultado.resultado === 'perdida') {
    return (
      <div className="space-y-3">
        <div className="bg-blue-600 border-2 border-blue-600 rounded-md p-6 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">
            Pérdida fiscal — sin ISR
          </p>
          <p className="font-display text-6xl font-bold mb-2 leading-none">$0</p>
          <p className="text-sm opacity-80">
            Vendiste por menos de lo que costó (considerando inflación y deducciones)
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 text-sm text-blue-800">
          <p className="text-xs">
            Puedes reportar esta pérdida en tu declaración anual para compensarla con otras ganancias (Art. 122 LISR).
          </p>
        </div>
      </div>
    );
  }

  return null;
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
          <ShareButton />
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary text-xs py-2 px-3 no-print"
          >
            <Printer size={14} /> Imprimir
          </button>
          <button type="button" onClick={onReset} className="btn-secondary text-xs py-2 px-3 no-print">
            <RotateCcw size={14} /> Nuevo
          </button>
        </div>
      </div>

      {/* Card de resultado principal */}
      <ResultCard resultado={resultado} />

      {/* Resumen de operación */}
      <ResumenOperacion datos={datos} resultado={resultado} />

      {/* Desglose paso a paso */}
      <FormulaBreakdown resultado={resultado} datos={datos} />

      {/* Disclaimer */}
      <DisclaimerBanner />

      <button type="button" onClick={onReset} className="btn-secondary w-full no-print">
        <RotateCcw size={16} /> Realizar otro cálculo
      </button>
    </div>
  );
}
