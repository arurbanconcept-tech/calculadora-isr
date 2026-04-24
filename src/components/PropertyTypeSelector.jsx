import { Home, Trees } from 'lucide-react';

const TIPOS = [
  {
    id: 'casa',
    icon: Home,
    titulo: 'Casa Habitación',
    descripcion: 'Departamento o casa donde vives. Puede calificar para la exención de hasta $5.8M.',
    tag: 'Exención disponible',
    tagColor: 'text-success bg-green-50 border-green-200',
  },
  {
    id: 'terreno',
    icon: Trees,
    titulo: 'Terreno',
    descripcion: 'Baldío, lote, local comercial u otro inmueble sin uso habitacional propio.',
    tag: 'Sin exención',
    tagColor: 'text-danger bg-red-50 border-red-200',
  },
];

export default function PropertyTypeSelector({ onSelect }) {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-semibold text-primary mb-2">
          ¿Qué tipo de inmueble vas a vender?
        </h2>
        <p className="text-muted text-sm">
          El tipo determina si aplica la exención fiscal de casa habitación (Art. 93 LISR).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TIPOS.map(tipo => {
          const Icon = tipo.icon;
          return (
            <button
              key={tipo.id}
              type="button"
              onClick={() => onSelect(tipo.id)}
              className="card text-left hover:shadow-elevated hover:border-primary/30 border border-transparent
                         transition-all group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex flex-col items-start gap-3">
                <div className="p-3 bg-bg rounded-sm group-hover:bg-primary/5 transition-colors">
                  <Icon size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary text-lg mb-1">{tipo.titulo}</h3>
                  <p className="text-muted text-xs leading-relaxed mb-3">{tipo.descripcion}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipo.tagColor}`}>
                    {tipo.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted mt-4">
        Fundamento: Arts. 119–128 LISR | Art. 93 fr. XIX inciso a) LISR
      </p>
    </div>
  );
}
