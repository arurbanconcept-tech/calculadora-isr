import Tooltip from './Tooltip.jsx';

const REQUISITOS = [
  {
    id: 'esCasaHabitacion',
    titulo: '¿Es tu casa habitación principal?',
    descripcion: 'El inmueble debe ser donde vives actualmente como residencia principal.',
    tooltip: 'No aplica para casas de vacaciones, inmuebles rentados ni propiedades comerciales. El SAT verifica esto con tu historial fiscal y comprobantes de domicilio.',
  },
  {
    id: 'noCasosPrevios3Anos',
    titulo: '¿No has vendido otra casa habitación en los últimos 3 años con exención?',
    descripcion: 'La exención solo se puede aplicar una vez cada 3 años.',
    tooltip: 'El Notario consulta el historial de los últimos 5 años ante el SAT. Si aplicaste esta exención en los últimos 3 años, esta venta no califica. Fundamento: Art. 93 fr. XIX inciso a) LISR.',
  },
  {
    id: 'puedeAcreditarDomicilio',
    titulo: '¿Tienes documentos que acrediten tu domicilio en esa propiedad?',
    descripcion: 'Necesitas al menos 2 documentos: INE, recibo CFE, estado de cuenta, etc.',
    tooltip: 'Documentos válidos: credencial INE, recibo de luz (CFE), recibo de teléfono fijo, estado de cuenta bancario. Deben estar a tu nombre o de un familiar directo y corresponder al domicilio del inmueble. Fundamento: Art. 155 RLISR.',
  },
];

export default function ExemptionChecker({ datos, onChange }) {
  const todosSeleccionados = REQUISITOS.every(r => datos[r.id]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-primary">
          Requisitos para la exención de casa habitación
        </p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
          ${todosSeleccionados ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-muted'}`}>
          {REQUISITOS.filter(r => datos[r.id]).length}/{REQUISITOS.length} cumplidos
        </span>
      </div>

      {REQUISITOS.map(req => (
        <label
          key={req.id}
          className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all
            ${datos[req.id]
              ? 'border-success/40 bg-green-50'
              : 'border-border bg-white hover:border-primary/30'
            }`}
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer shrink-0"
            checked={!!datos[req.id]}
            onChange={e => onChange(req.id, e.target.checked)}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-medium text-text">{req.titulo}</span>
              <Tooltip texto={req.tooltip} />
            </div>
            <p className="text-xs text-muted mt-0.5">{req.descripcion}</p>
          </div>
        </label>
      ))}

      {todosSeleccionados && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-sm p-3 text-xs text-green-700">
          <span className="text-base">✅</span>
          <span>
            <strong>Podría aplicar la exención de 700,000 UDIS.</strong> El monto exacto depende
            del precio vs. el límite en pesos el día de la firma. El Notario lo confirmará.
          </span>
        </div>
      )}

      {!todosSeleccionados && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-700">
          <span className="text-base">⚠️</span>
          <span>
            Al no cumplir todos los requisitos, <strong>no aplica la exención</strong> y el ISR
            se calculará sobre la ganancia total.
          </span>
        </div>
      )}
    </div>
  );
}
