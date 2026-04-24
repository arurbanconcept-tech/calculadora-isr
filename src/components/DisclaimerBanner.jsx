import { AlertTriangle } from 'lucide-react';
import { CONFIG } from '../constants/config.js';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-800">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <p>
          <strong>Estimado orientativo.</strong> El ISR definitivo lo determina el Notario y se ajusta en tu declaración anual de abril. Consulta a un contador o al Notario antes de firmar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Aviso importante</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Este resultado es una <strong>ESTIMACIÓN ORIENTATIVA</strong>, no un cálculo fiscal oficial.
            El ISR definitivo depende de todos tus ingresos del año fiscal, tus deducciones personales
            (Art. 151 LISR), el valor exacto de la UDI el día de la firma y los INPC exactos de los meses
            correspondientes.{' '}
            <strong>Siempre confirma el cálculo con el Notario que formalice la operación y con un
            contador público certificado.</strong>
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Tarifa vigente: {CONFIG.FUENTE_TARIFA} · Valor UDI referencia: ${CONFIG.VALOR_UDI_HOY} ({CONFIG.FECHA_UDI})
          </p>
        </div>
      </div>
    </div>
  );
}
