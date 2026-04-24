import { formatInputCurrency, parseAmount, MESES_NOMBRES } from '../utils/formatters.js';
import { ANIO_MINIMO } from '../utils/inpcData.js';
import ExemptionChecker from './ExemptionChecker.jsx';
import Tooltip from './Tooltip.jsx';
import { ArrowRight, RefreshCw } from 'lucide-react';

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

  const handleAmountChange = (campo, valor) => {
    const limpio = valor.replace(/[^0-9]/g, '');
    onChange(campo, limpio ? Number(limpio) : '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Paso 1 — Información básica</h2>
        <button type="button" onClick={onEjemplo} className="btn-secondary text-xs py-2 px-3 no-print">
          <RefreshCw size={12} />
          Ver ejemplo
        </button>
      </div>

      {/* Precio de venta */}
      <div className="card space-y-5">
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
              onChange={e => handleAmountChange('precioVenta', e.target.value.replace(/,/g, ''))}
            />
          </div>
          {errores?.precioVenta && <p className="error-text">{errores.precioVenta}</p>}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MonthYearPicker
            label="📅 Fecha de adquisición"
            value={datos.fechaAdquisicion}
            onChange={v => onChange('fechaAdquisicion', v)}
            tooltip="El mes y año en que compraste el inmueble. Si fue antes del año 2000, el cálculo puede ser menos preciso."
            error={errores?.fechaAdquisicion}
            maxYear={ANIO_ACTUAL}
          />
          <MonthYearPicker
            label="📅 Fecha de venta (estimada)"
            value={datos.fechaVenta}
            onChange={v => onChange('fechaVenta', v)}
            tooltip="El mes y año en que planeas firmar ante Notario. Si aún no sabes la fecha exacta, usa el mes actual."
            error={errores?.fechaVenta}
            maxYear={ANIO_ACTUAL + 2}
          />
        </div>
      </div>

      {/* Exención (solo casa habitación) */}
      {esCasa && (
        <div className="card">
          <p className="text-sm font-medium text-primary mb-1">
            🏠 Exención de casa habitación — Art. 93 fr. XIX inciso a) LISR
          </p>
          <p className="text-xs text-muted mb-4">
            Si cumples los 3 requisitos, tu venta puede estar exenta hasta 700,000 UDIS (~$5.8 millones).
          </p>
          <ExemptionChecker datos={datos} onChange={onChange} />
        </div>
      )}

      <button type="button" onClick={onNext} className="btn-primary w-full">
        Continuar
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
