import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Tooltip from './Tooltip.jsx';
import { MESES_NOMBRES } from '../utils/formatters.js';
import { ANIO_MINIMO } from '../utils/inpcData.js';

const ANIO_ACTUAL = new Date().getFullYear();

function MonthYearPicker({ label, value, onChange, tooltip }) {
  const parts = value ? value.split('-') : ['', ''];
  const [localAnio, setLocalAnio] = useState(parts[0] || '');
  const [localMes, setLocalMes] = useState(parts[1] || '');

  useEffect(() => {
    const p = value ? value.split('-') : ['', ''];
    setLocalAnio(p[0] || '');
    setLocalMes(p[1] || '');
  }, [value]);

  const handleMes = (val) => {
    setLocalMes(val);
    if (val && localAnio) onChange(`${localAnio}-${val}`);
    else onChange('');
  };

  const handleAnio = (val) => {
    setLocalAnio(val);
    if (localMes && val) onChange(`${val}-${localMes}`);
    else onChange('');
  };

  const anios = [];
  for (let a = ANIO_ACTUAL; a >= ANIO_MINIMO; a--) anios.push(a);

  return (
    <div>
      <label className="label">{label}{tooltip && <Tooltip texto={tooltip} />}</label>
      <div className="flex gap-2">
        <select className="input-field flex-1" value={localMes} onChange={e => handleMes(e.target.value)}>
          <option value="">Mes</option>
          {MESES_NOMBRES.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>
        <select className="input-field w-28" value={localAnio} onChange={e => handleAnio(e.target.value)}>
          <option value="">Año</option>
          {anios.map(a => <option key={a} value={String(a)}>{a}</option>)}
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
      <div>
        <h2 className="section-title">Paso 2 — Costos de adquisición</h2>
        <p className="text-xs text-muted">
          Entre más deducciones tengas documentadas, menor será tu ISR.
        </p>
      </div>

      <div className="card space-y-5">
        {/* Costo de adquisición */}
        <AmountInput
          label="💵 ¿Cuánto pagaste cuando compraste el inmueble?"
          value={datos.costoAdquisicion}
          onChange={v => onChange('costoAdquisicion', v)}
          placeholder={esCasa ? '1,500,000' : '800,000'}
          tooltip="El precio que pagaste al comprar según la escritura de compraventa. Se actualiza con el INPC para calcular tu ganancia real."
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
              <Tooltip texto="Si tienes la escritura detallada, ingresa los montos por separado. Si no, usaremos 20% terreno / 80% construcción. La construcción se deprecia 3% anual; el terreno no." />
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
                    ⚠️ La suma no coincide con el costo total.
                  </p>
                )}
              </div>
            ) : (
              <div className="pl-6 py-2 bg-bg rounded-sm text-xs text-muted">
                Se usará: <strong>20% terreno</strong> / <strong>80% construcción</strong>
              </div>
            )}
          </div>
        )}

        {/* Mejoras con facturas — aplica para TODOS los tipos */}
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
              🧾 ¿Tienes facturas (CFDI) de mejoras o construcción?
            </label>
            <Tooltip texto={esCasa
              ? "Remodelaciones, ampliaciones, o mejoras al inmueble respaldadas con facturas electrónicas CFDI. Estas REDUCEN tu impuesto porque aumentan el costo fiscal. Art. 121 fr. II LISR."
              : "Para terrenos: construcciones, bardas, obras de urbanización o cualquier mejora con CFDI. Se actualizan con INPC y reducen tu ganancia gravable. Art. 121 fr. II LISR."
            } />
          </div>

          {tieneMejoras && (
            <div className="space-y-4 pl-6">
              <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-xs text-green-700">
                💡 <strong>Cada peso de mejora documentada reduce tu ISR.</strong> Incluye todas las facturas que tengas: remodelaciones, ampliaciones, instalaciones, bardas, pavimentación, etc.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AmountInput
                  label="Total de mejoras con factura"
                  value={datos.costoMejoras}
                  onChange={v => onChange('costoMejoras', v)}
                  placeholder="200,000"
                />
                <MonthYearPicker
                  label="Fecha aproximada de las mejoras"
                  value={datos.fechaMejoras}
                  onChange={v => onChange('fechaMejoras', v)}
                  tooltip="Si las mejoras fueron en distintas fechas, usa una fecha promedio. Entre más antiguas, mayor será el factor de actualización."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips para reducir ISR */}
      <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
        <p className="text-sm font-semibold text-primary mb-3">💡 ¿Cómo puedes reducir tu ISR?</p>
        <div className="space-y-2 text-xs text-muted">
          <div className="flex items-start gap-2">
            <span className="text-success font-bold shrink-0">↓</span>
            <span><strong>Mejoras con CFDI</strong> — Cada factura de remodelación o construcción aumenta tu costo fiscal y baja tu ganancia gravable.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-success font-bold shrink-0">↓</span>
            <span><strong>Gastos notariales</strong> — Los honorarios del notario al comprar (con factura) son deducibles y se actualizan con inflación.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-success font-bold shrink-0">↓</span>
            <span><strong>Comisión inmobiliaria</strong> — Si pagaste comisión con CFDI, es 100% deducible.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-success font-bold shrink-0">↓</span>
            <span><strong>Factor INPC</strong> — La inflación acumulada actualiza tu costo de compra automáticamente. Entre más tiempo tuviste el inmueble, mayor el factor.</span>
          </div>
          {esCasa && (
            <div className="flex items-start gap-2">
              <span className="text-success font-bold shrink-0">↓</span>
              <span><strong>Exención casa habitación</strong> — Si cumples los 3 requisitos del Paso 1, hasta ~$5.8M de tu ganancia está exenta de ISR.</span>
            </div>
          )}
        </div>
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
