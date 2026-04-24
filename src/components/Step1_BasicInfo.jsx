import { MESES_NOMBRES } from '../utils/formatters.js';
import { ANIO_MINIMO } from '../utils/inpcData.js';
import ExemptionChecker from './ExemptionChecker.jsx';
import Tooltip from './Tooltip.jsx';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { CONFIG } from '../constants/config.js';

const ANIO_ACTUAL = new Date().getFullYear();

function MonthYearPicker({ label, value, onChange, tooltip, error, maxYear }) {
  const [mes, anio] = value ? value.split('-') : ['', ''];

  const handleChange = (campo, val) => {
    const newMes = campo === 'mes' ? val : mes;
    const newAnio = campo === 'anio' ? val : anio;
    if (newMes && newAnio) onChange(`${newAnio}-${newMes}`);
    else onChange('');
  };

  const anios = [];
  for (let a = (maxYear || ANIO_ACTUAL); a >= ANIO_MINIMO; a--) anios.push(a);

  return (
    <div>
      <label className="label">
        {label}
        {tooltip && <Tooltip texto={tooltip} />}
      </label>
      <div className="flex gap-2">
        <select
          className="input-field flex-1"
          value={mes || ''}
          onChange={e => handleChange('mes', e.target.value)}
        >
          <option value="">Mes</option>
          {MESES_NOMBRES.map((m, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>
        <select
          className="input-field w-28"
          value={anio || ''}
          onChange={e => handleChange('anio', e.target.value)}
        >
          <option value="">Año</option>
          {anios.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default function Step1_BasicInfo({ datos, onChange, errores, onNext, onEjemplo }) {
  const esCasa = datos.tipoInmueble === 'casa';
  const cumpleExencion = datos.esCasaHabitacion && datos.noCasosPrevios3Anos && datos.puedeAcreditarDomicilio;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Paso 1 — Información básica</h2>
        <button type="button" onClick={onEjemplo} className="btn-secondary text-xs py-2 px-3 no-print">
          <RefreshCw size={12} />
          Ver ejemplo
        </button>
      </div>

      {/* Tipo de inmueble seleccionado */}
      <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-sm px-4 py-2">
        <span className="text-lg">{esCasa ? '🏠' : '🌿'}</span>
        <span className="text-sm font-medium text-primary">
          {esCasa ? 'Casa habitación' : 'Terreno / inmueble no habitacional'}
        </span>
        <button
          type="button"
          onClick={() => onChange('tipoInmueble', null)}
          className="ml-auto text-xs text-muted underline"
        >
          Cambiar
        </button>
      </div>

      <div className="card space-y-5">
        {/* Precio de venta */}
        <div>
          <label className="label">
            💰 Precio de venta (escriturado)
            <Tooltip texto="El precio que aparecerá en la escritura ante el Notario. Debe ser el valor real de la operación." />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
            <input
              type="text"
              inputMode="numeric"
              className="input-field pl-7"
              placeholder="8,000,000"
              value={datos.precioVenta ? Number(datos.precioVenta).toLocaleString('es-MX') : ''}
              onChange={e => {
                const limpio = e.target.value.replace(/[^0-9]/g, '');
                onChange('precioVenta', limpio ? Number(limpio) : '');
              }}
            />
          </div>
          {errores?.precioVenta && <p className="error-text">{errores.precioVenta}</p>}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MonthYearPicker
            label="📅 Mes y año que compraste"
            value={datos.fechaAdquisicion}
            onChange={v => onChange('fechaAdquisicion', v)}
            tooltip="El mes y año en que compraste el inmueble según tu escritura de compraventa."
            error={errores?.fechaAdquisicion}
            maxYear={ANIO_ACTUAL}
          />
          <MonthYearPicker
            label="📅 Mes y año que vas a vender"
            value={datos.fechaVenta}
            onChange={v => onChange('fechaVenta', v)}
            tooltip="El mes y año en que planeas firmar la venta ante Notario."
            error={errores?.fechaVenta}
            maxYear={ANIO_ACTUAL + 2}
          />
        </div>
      </div>

      {/* Exención (solo casa habitación) */}
      {esCasa && (
        <div className="card space-y-4">
          <div>
            <p className="text-sm font-semibold text-primary mb-1">
              🏠 Exención de casa habitación — Art. 93 fr. XIX inciso a) LISR
            </p>
            <p className="text-xs text-muted">
              Si cumples los 3 requisitos, tu ganancia está exenta hasta 700,000 UDIS
              (~${CONFIG.LIMITE_EXENCION_PESOS.toLocaleString('es-MX', {maximumFractionDigits:0})} pesos).
              <strong> Si no los cumples, el ISR se calcula normalmente sobre toda la ganancia.</strong>
            </p>
          </div>
          <ExemptionChecker datos={datos} onChange={onChange} />

          {!cumpleExencion && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-700">
              ⚠️ <strong>Sin exención:</strong> El ISR se calculará sobre el 100% de tu ganancia con la tarifa progresiva del Art. 152 LISR. Puedes reducirlo con facturas de mejoras y deducciones en el siguiente paso.
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={onNext} className="btn-primary w-full">
        Continuar
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
