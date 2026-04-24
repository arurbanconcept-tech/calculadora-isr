import { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Tooltip from './Tooltip.jsx';
import { MESES_NOMBRES } from '../utils/formatters.js';
import { ANIO_MINIMO } from '../utils/inpcData.js';

const ANIO_ACTUAL = new Date().getFullYear();

function MonthYearPicker({ label, value, onChange, tooltip }) {
  const [mes, anio] = value ? value.split('-') : ['', ''];
  const handleChange = (campo, val) => {
    const newMes = campo === 'mes' ? val : mes;
    const newAnio = campo === 'anio' ? val : anio;
    if (newMes && newAnio) onChange(`${newAnio}-${newMes}`);
    else onChange('');
  };
  const anios = [];
  for (let a = ANIO_ACTUAL; a >= ANIO_MINIMO; a--) anios.push(a);

  return (
    <div>
      <label className="label">{label}{tooltip && <Tooltip texto={tooltip} />}</label>
      <div className="flex gap-2">
        <select className="input-field flex-1" value={mes || ''} onChange={e => handleChange('mes', e.target.value)}>
          <option value="">Mes</option>
          {MESES_NOMBRES.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>
        <select className="input-field w-28" value={anio || ''} onChange={e => handleChange('anio', e.target.value)}>
          <option value="">Año</option>
          {anios.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}

function AmountInput({ label, value, onChange, placeholder, tooltip, prefix = '$' }) {
  return (
    <div>
      <label className="label">{label}{tooltip && <Tooltip texto={tooltip} />}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">{prefix}</span>
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

export default function Step2_Costs({ datos, onChange, errores, onNext, onBack }) {
  const esCasa = datos.tipoInmueble === 'casa';
  const [separaTerreno, setSeparaTerreno] = useState(!!(datos.costoTerreno || datos.costoConstruccion));
  const [tieneMejoras, setTieneMejoras] = useState(!!(datos.costoMejoras));

  return (
    <div className="space-y-6">
      <h2 className="section-title">Paso 2 — Costos de adquisición</h2>

      <div className="card space-y-5">
        {/* Costo de adquisición total */}
        <AmountInput
          label="💵 ¿Cuánto pagaste cuando compraste el inmueble?"
          value={datos.costoAdquisicion}
          onChange={v => onChange('costoAdquisicion', v)}
          placeholder="1,500,000"
          tooltip="El precio que pagaste al comprar, según la escritura de compraventa. Este costo se actualizará con el INPC para calcular tu ganancia real."
        />
        {errores?.costoAdquisicion && <p className="error-text">{errores.costoAdquisicion}</p>}

        {/* Separación terreno/construcción (solo casa) */}
        {esCasa && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="separaTerreno"
                className="h-4 w-4 accent-primary cursor-pointer"
                checked={separaTerreno}
                onChange={e => {
                  setSeparaTerreno(e.target.checked);
                  if (!e.target.checked) {
                    onChange('costoTerreno', 0);
                    onChange('costoConstruccion', 0);
                  }
                }}
              />
              <label htmlFor="separaTerreno" className="text-sm font-medium cursor-pointer">
                🏗️ ¿Puedes separar el costo en terreno y construcción?
              </label>
              <Tooltip texto="Si tienes la escritura detallada o un avalúo que separa valores, ingresa los montos. Si no, usaremos la regla supletoria del SAT: 20% terreno / 80% construcción. El terreno no se deprecia; la construcción sí (3% anual)." />
            </div>

            {separaTerreno ? (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <AmountInput
                  label="Costo del terreno"
                  value={datos.costoTerreno}
                  onChange={v => onChange('costoTerreno', v)}
                  placeholder="300,000"
                />
                <AmountInput
                  label="Costo de construcción"
                  value={datos.costoConstruccion}
                  onChange={v => onChange('costoConstruccion', v)}
                  placeholder="1,200,000"
                />
                {datos.costoTerreno && datos.costoConstruccion && datos.costoAdquisicion &&
                 (Number(datos.costoTerreno) + Number(datos.costoConstruccion)) !== Number(datos.costoAdquisicion) && (
                  <p className="col-span-2 text-xs text-amber-600">
                    ⚠️ La suma (${(Number(datos.costoTerreno) + Number(datos.costoConstruccion)).toLocaleString('es-MX')})
                    {' '}no coincide con el costo total (${Number(datos.costoAdquisicion).toLocaleString('es-MX')}).
                  </p>
                )}
              </div>
            ) : (
              <div className="pl-6 py-2 bg-bg rounded-sm text-xs text-muted">
                Se usará la regla supletoria: <strong>20% terreno</strong> / <strong>80% construcción</strong>
              </div>
            )}
          </div>
        )}

        {/* Mejoras (solo casa) */}
        {esCasa && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="tieneMejoras"
                className="h-4 w-4 accent-primary cursor-pointer"
                checked={tieneMejoras}
                onChange={e => {
                  setTieneMejoras(e.target.checked);
                  if (!e.target.checked) {
                    onChange('costoMejoras', 0);
                    onChange('fechaMejoras', null);
                  }
                }}
              />
              <label htmlFor="tieneMejoras" className="text-sm font-medium cursor-pointer">
                🔨 ¿Realizaste mejoras al inmueble con facturas (CFDI)?
              </label>
              <Tooltip texto="Solo se pueden deducir mejoras o remodelaciones respaldadas con facturas electrónicas (CFDI). Las mejoras aumentan el costo fiscal y reducen tu impuesto. Fundamento: Art. 121 fr. II LISR." />
            </div>

            {tieneMejoras && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                <AmountInput
                  label="Costo total de mejoras"
                  value={datos.costoMejoras}
                  onChange={v => onChange('costoMejoras', v)}
                  placeholder="200,000"
                />
                <MonthYearPicker
                  label="Fecha aproximada de las mejoras"
                  value={datos.fechaMejoras}
                  onChange={v => onChange('fechaMejoras', v)}
                  tooltip="El mes y año en que se realizaron las mejoras. Si fueron en distintas fechas, usa una fecha promedio."
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1">
          <ArrowLeft size={16} /> Atrás
        </button>
        <button type="button" onClick={onNext} className="btn-primary flex-1">
          Continuar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
