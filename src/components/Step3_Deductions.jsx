import { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import Tooltip from './Tooltip.jsx';
import DisclaimerBanner from './DisclaimerBanner.jsx';

function AmountInput({ label, value, onChange, placeholder, tooltip }) {
  return (
    <div>
      <label className="label">{label}{tooltip && <Tooltip texto={tooltip} />}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
        <input
          type="text"
          inputMode="numeric"
          className="input-field pl-7"
          placeholder={placeholder}
          value={value ? Number(value).toLocaleString('es-MX') : ''}
          onChange={e => {
            const limpio = e.target.value.replace(/[^0-9]/g, '');
            onChange(limpio ? Number(limpio) : '');
          }}
        />
      </div>
    </div>
  );
}

export default function Step3_Deductions({ datos, onChange, errores, onCalculate, onBack }) {
  const [tieneComision, setTieneComision] = useState(datos.comisionInmobiliaria > 0);

  const comisionMonto = datos.precioVenta && datos.comisionInmobiliaria
    ? Math.round(datos.precioVenta * datos.comisionInmobiliaria / 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">Paso 3 — Deducciones adicionales</h2>
        <p className="text-xs text-muted">
          Estos gastos reducen tu base gravable y, por lo tanto, el ISR a pagar.
          Guarda todas las facturas. Fundamento: Art. 121 fr. III y IV LISR.
        </p>
      </div>

      <div className="card space-y-5">
        {/* Gastos notariales de compra */}
        <AmountInput
          label="📄 Gastos notariales de la compra original"
          value={datos.gastosNotarialesCompra}
          onChange={v => onChange('gastosNotarialesCompra', v)}
          placeholder="90,000"
          tooltip="Los honorarios del Notario, derechos y gastos que pagaste cuando compraste el inmueble. Se actualizan con el INPC desde la fecha de compra. Si no tienes el dato exacto, deja en 0."
        />

        {/* Gastos notariales de venta */}
        <AmountInput
          label="📄 Gastos notariales de la venta (estimado)"
          value={datos.gastosNotarialesVenta}
          onChange={v => onChange('gastosNotarialesVenta', v)}
          placeholder="80,000"
          tooltip="Los honorarios del Notario y derechos de la escritura de venta. Típicamente entre 1% y 3% del valor de la operación. Son deducibles en el cálculo del ISR."
        />

        {/* Comisión inmobiliaria */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="tieneComision"
              className="h-4 w-4 accent-primary cursor-pointer"
              checked={tieneComision}
              onChange={e => {
                setTieneComision(e.target.checked);
                if (!e.target.checked) onChange('comisionInmobiliaria', 0);
              }}
            />
            <label htmlFor="tieneComision" className="text-sm font-medium cursor-pointer">
              🤝 ¿Pagas comisión a una inmobiliaria o asesor?
            </label>
            <Tooltip texto="La comisión del agente o inmobiliaria que vendió la propiedad. Es deducible. Normalmente entre 3% y 6% del precio de venta. Fundamento: Art. 121 fr. IV LISR." />
          </div>

          {tieneComision && (
            <div className="pl-6 space-y-2">
              <div>
                <label className="label">Porcentaje de comisión (%)</label>
                <div className="relative max-w-[120px]">
                  <input
                    type="number"
                    className="input-field pr-8"
                    placeholder="5"
                    min="0"
                    max="20"
                    step="0.5"
                    value={datos.comisionInmobiliaria || ''}
                    onChange={e => onChange('comisionInmobiliaria', parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
                </div>
              </div>
              {comisionMonto > 0 && (
                <p className="text-xs text-muted">
                  = <strong>${comisionMonto.toLocaleString('es-MX')}</strong> sobre el precio de venta
                </p>
              )}
            </div>
          )}
        </div>

        {/* Costo del avalúo */}
        <AmountInput
          label="📊 Costo del avalúo (si aplica)"
          value={datos.costoAvaluo}
          onChange={v => onChange('costoAvaluo', v)}
          placeholder="5,000"
          tooltip="El costo del avalúo de la propiedad requerido para la escritura. Si no aplica o no tienes el dato, deja en 0."
        />
      </div>

      {/* Resumen rápido de deducciones */}
      {(datos.gastosNotarialesCompra || datos.gastosNotarialesVenta || datos.comisionInmobiliaria || datos.costoAvaluo) ? (
        <div className="card bg-primary/5 border border-primary/10">
          <p className="text-xs font-semibold text-primary mb-2">Resumen deducciones adicionales</p>
          <div className="space-y-1 text-xs text-muted">
            {datos.gastosNotarialesCompra > 0 && (
              <div className="flex justify-between">
                <span>Gastos notariales compra</span>
                <span className="font-medium">${Number(datos.gastosNotarialesCompra).toLocaleString('es-MX')}</span>
              </div>
            )}
            {datos.gastosNotarialesVenta > 0 && (
              <div className="flex justify-between">
                <span>Gastos notariales venta</span>
                <span className="font-medium">${Number(datos.gastosNotarialesVenta).toLocaleString('es-MX')}</span>
              </div>
            )}
            {comisionMonto > 0 && (
              <div className="flex justify-between">
                <span>Comisión inmobiliaria ({datos.comisionInmobiliaria}%)</span>
                <span className="font-medium">${comisionMonto.toLocaleString('es-MX')}</span>
              </div>
            )}
            {datos.costoAvaluo > 0 && (
              <div className="flex justify-between">
                <span>Avalúo</span>
                <span className="font-medium">${Number(datos.costoAvaluo).toLocaleString('es-MX')}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <DisclaimerBanner compact />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button type="button" onClick={onCalculate} className="btn-accent flex-1 text-base font-semibold">
          <Calculator size={18} />
          Calcular ISR
        </button>
      </div>
    </div>
  );
}
