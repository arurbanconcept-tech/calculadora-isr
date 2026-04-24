import { useState } from 'react';
import StepIndicator from './components/StepIndicator.jsx';
import PropertyTypeSelector from './components/PropertyTypeSelector.jsx';
import Step1_BasicInfo from './components/Step1_BasicInfo.jsx';
import Step2_Costs from './components/Step2_Costs.jsx';
import Step3_Deductions from './components/Step3_Deductions.jsx';
import Step4_Results from './components/Step4_Results.jsx';
import { calcularISRCompleto, EJEMPLO_CASA, EJEMPLO_TERRENO } from './utils/isrCalculations.js';

const ESTADO_INICIAL = {
  tipoInmueble: null,
  precioVenta: '',
  fechaAdquisicion: '',
  fechaVenta: '',
  costoAdquisicion: '',
  costoTerreno: 0,
  costoConstruccion: 0,
  costoMejoras: 0,
  fechaMejoras: null,
  gastosNotarialesCompra: 0,
  gastosNotarialesVenta: 0,
  comisionInmobiliaria: 0,
  costoAvaluo: 0,
  esCasaHabitacion: false,
  noCasosPrevios3Anos: false,
  puedeAcreditarDomicilio: false,
};

function validarPaso(paso, datos) {
  const errores = {};

  if (paso === 1) {
    if (!datos.precioVenta || Number(datos.precioVenta) < 100_000) {
      errores.precioVenta = 'El precio de venta debe ser al menos $100,000.';
    }
    if (!datos.fechaAdquisicion) {
      errores.fechaAdquisicion = 'Selecciona mes y año de adquisición.';
    }
    if (!datos.fechaVenta) {
      errores.fechaVenta = 'Selecciona mes y año de venta.';
    }
    if (datos.fechaAdquisicion && datos.fechaVenta && datos.fechaAdquisicion >= datos.fechaVenta) {
      errores.fechaVenta = 'La fecha de venta debe ser posterior a la de adquisición.';
    }
  }

  if (paso === 2) {
    if (!datos.costoAdquisicion || Number(datos.costoAdquisicion) <= 0) {
      errores.costoAdquisicion = 'Ingresa el costo de adquisición.';
    }
  }

  return errores;
}

export default function App() {
  const [paso, setPaso] = useState(0);  // 0=tipo, 1-3=pasos, 4=resultado
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState({});

  const actualizarDato = (campo, valor) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: undefined }));
  };

  const avanzar = (numeroPaso) => {
    const nuevosErrores = validarPaso(numeroPaso, datos);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});
    setPaso(numeroPaso + 1);
  };

  const calcular = () => {
    const nuevosErrores = validarPaso(3, datos);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    const res = calcularISRCompleto(datos);
    setResultado(res);
    setPaso(4);
  };

  const reset = () => {
    setDatos(ESTADO_INICIAL);
    setResultado(null);
    setErrores({});
    setPaso(0);
  };

  const cargarEjemplo = () => {
    const ejemplo = datos.tipoInmueble === 'terreno' ? EJEMPLO_TERRENO : EJEMPLO_CASA;
    setDatos(ejemplo);
    setErrores({});
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-2">
          Calculadora ISR
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto">
          Estima el impuesto que pagarás al vender tu inmueble en México.
          Basado en Arts. 119–128 LISR, vigente {new Date().getFullYear()}.
        </p>
      </header>

      {/* Indicador de pasos (visible del paso 1 al 4) */}
      {paso > 0 && <StepIndicator pasoActual={paso} />}

      {/* Contenido principal */}
      <main className="max-w-2xl mx-auto">
        {paso === 0 && (
          <PropertyTypeSelector
            onSelect={tipo => {
              actualizarDato('tipoInmueble', tipo);
              setPaso(1);
            }}
          />
        )}

        {paso === 1 && (
          <div className="card">
            <Step1_BasicInfo
              datos={datos}
              onChange={actualizarDato}
              errores={errores}
              onNext={() => avanzar(1)}
              onEjemplo={cargarEjemplo}
            />
          </div>
        )}

        {paso === 2 && (
          <div className="card">
            <Step2_Costs
              datos={datos}
              onChange={actualizarDato}
              errores={errores}
              onNext={() => avanzar(2)}
              onBack={() => setPaso(1)}
            />
          </div>
        )}

        {paso === 3 && (
          <div className="card">
            <Step3_Deductions
              datos={datos}
              onChange={actualizarDato}
              errores={errores}
              onCalculate={calcular}
              onBack={() => setPaso(2)}
            />
          </div>
        )}

        {paso === 4 && resultado && (
          <Step4_Results
            resultado={resultado}
            datos={datos}
            onReset={reset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center mt-12 text-xs text-muted">
        <p>Urban Concept · Calculadora ISR Inmobiliaria · Solo para estimaciones orientativas</p>
        <p className="mt-1">Normativa: LISR vigente · Anexo 8 RMF {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
