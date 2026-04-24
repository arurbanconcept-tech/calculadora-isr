import { Check } from 'lucide-react';

const PASOS = [
  { num: 1, label: 'Información básica' },
  { num: 2, label: 'Costos' },
  { num: 3, label: 'Deducciones' },
  { num: 4, label: 'Resultado' },
];

export default function StepIndicator({ pasoActual }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {PASOS.map((paso, idx) => {
          const completado = pasoActual > paso.num;
          const activo = pasoActual === paso.num;
          const pendiente = pasoActual < paso.num;

          return (
            <div key={paso.num} className="flex items-center flex-1">
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                    ${completado ? 'bg-success text-white' : ''}
                    ${activo ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${pendiente ? 'bg-border text-muted' : ''}
                  `}
                >
                  {completado ? <Check size={14} /> : paso.num}
                </div>
                <span className={`text-xs mt-1 hidden sm:block text-center max-w-[80px]
                  ${activo ? 'text-primary font-medium' : 'text-muted'}`}>
                  {paso.label}
                </span>
              </div>

              {/* Línea conectora */}
              {idx < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all
                  ${pasoActual > paso.num ? 'bg-success' : 'bg-border'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
