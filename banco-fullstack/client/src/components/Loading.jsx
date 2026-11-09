export default function Loading({ texto = 'Cargando...', pequeno = false }) {
  const tam = pequeno ? 'h-4 w-4 border-2' : 'h-10 w-10 border-4';
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-slate-500" role="status">
      <span className={`${tam} animate-spin rounded-full border-slate-200 border-t-esmeralda-500`} />
      {!pequeno && <span className="text-sm font-medium">{texto}</span>}
    </div>
  );
}
