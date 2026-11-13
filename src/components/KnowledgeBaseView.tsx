import React, { useMemo, useState } from 'react';
import { buscarArticulosKbRelevantes } from '../data/serviceDeskStore';
import { ArticuloKb } from '../types/itsm';

interface KnowledgeBaseViewProps {
  articulosKb: ArticuloKb[];
  onCrearArticuloKb: (nuevo: {
    titulo: string;
    categoria: string;
    keywords: string[];
    sintoma: string;
    procedimiento: string;
  }) => void;
}

const CATEGORIAS_KB = [
  'Todas',
  'IAM / Identidad',
  'Redes & Conectividad',
  'Puesto de Trabajo',
  'Base de Datos',
  'Seguridad & Certificados',
  'Infraestructura Cloud',
];

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  articulosKb,
  onCrearArticuloKb,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [nuevaCat, setNuevaCat] = useState('IAM / Identidad');
  const [keywordsTxt, setKeywordsTxt] = useState('');
  const [sintoma, setSintoma] = useState('');
  const [procedimiento, setProcedimiento] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const articulosFiltrados = useMemo(() => {
    const porCategoria =
      categoria === 'Todas'
        ? articulosKb
        : articulosKb.filter((a) => a.categoria === categoria);

    if (!busqueda.trim()) {
      return porCategoria.map((articulo) => ({
        articulo,
        coincidencias: [] as string[],
      }));
    }

    return buscarArticulosKbRelevantes(busqueda, porCategoria).map((r) => ({
      articulo: r.articulo,
      coincidencias: r.coincidencias,
    }));
  }, [articulosKb, busqueda, categoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim().length < 6 || procedimiento.trim().length < 15) {
      setErrorForm(
        'Ingresa un título (mín. 6 caracteres) y procedimiento técnico (mín. 15 caracteres).'
      );
      return;
    }
    const keywords = keywordsTxt
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length >= 2);

    onCrearArticuloKb({
      titulo: titulo.trim(),
      categoria: nuevaCat,
      keywords:
        keywords.length > 0
          ? keywords
          : titulo
              .toLowerCase()
              .split(/\s+/)
              .filter((w) => w.length >= 4)
              .slice(0, 5),
      sintoma: sintoma.trim() || 'Incidencia documentada para soporte Nivel 1.',
      procedimiento: procedimiento.trim(),
    });

    setTitulo('');
    setKeywordsTxt('');
    setSintoma('');
    setProcedimiento('');
    setErrorForm('');
    setMostrarFormulario(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#111827] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <i
              className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar palabra clave (vpn, ad, token, saml...)"
              aria-label="Buscar artículos en la Base de Conocimiento"
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] py-2 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoría KB"
            className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            {CATEGORIAS_KB.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setMostrarFormulario((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#161E2E] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <i
            className={`fa-solid ${mostrarFormulario ? 'fa-xmark' : 'fa-plus'} text-[11px]`}
            aria-hidden="true"
          />
          <span>
            {mostrarFormulario
              ? 'Cerrar Formulario'
              : 'Publicar Nuevo Artículo KB'}
          </span>
        </button>
      </div>

      {/* Create New KB Article Form */}
      {mostrarFormulario && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4"
        >
          <h2 className="font-display text-sm font-semibold text-slate-100">
            Nuevo Artículo en Base de Conocimiento (KEDB)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="kb-titulo"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Título del procedimiento *
              </label>
              <input
                id="kb-titulo"
                type="text"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  if (errorForm) setErrorForm('');
                }}
                placeholder="Ej. Cómo limpiar caché Kerberos tras cambio de contraseña"
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="kb-cat"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Categoría
              </label>
              <select
                id="kb-cat"
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIAS_KB.filter((c) => c !== 'Todas').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="kb-kw"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Palabras clave (separadas por comas)
              </label>
              <input
                id="kb-kw"
                type="text"
                value={keywordsTxt}
                onChange={(e) => setKeywordsTxt(e.target.value)}
                placeholder="vpn, token, mfa, bloqueo, ad"
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 font-mono text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="kb-sintoma"
                className="mb-1.5 block text-xs font-medium text-slate-300"
              >
                Síntoma principal reportado
              </label>
              <input
                id="kb-sintoma"
                type="text"
                value={sintoma}
                onChange={(e) => setSintoma(e.target.value)}
                placeholder="Qué describe el usuario cuando llama..."
                className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="kb-proc"
              className="mb-1.5 block text-xs font-medium text-slate-300"
            >
              Pasos de resolución para N1 (FCR) *
            </label>
            <textarea
              id="kb-proc"
              rows={3}
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              placeholder="1. Validar... 2. Ejecutar... 3. Confirmar con el usuario..."
              className="w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {errorForm && (
            <p className="text-xs text-red-400" role="alert">
              {errorForm}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Publicar Artículo KEDB
            </button>
          </div>
        </form>
      )}

      {/* Articles Grid */}
      {articulosFiltrados.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#111827] px-6 py-12 text-center">
          <i
            className="fa-solid fa-book-open mb-2 text-2xl text-slate-500"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-200">
            No se encontraron artículos en la Base de Conocimiento
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Prueba con otras palabras clave o publica la solución desde un Problema N2 cerrado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {articulosFiltrados.map(({ articulo, coincidencias }) => (
            <article
              key={articulo.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#111827] p-5 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-blue-400">
                      {articulo.id}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-300">{articulo.categoria}</span>
                    {articulo.problemaOrigenId && (
                      <>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="font-mono text-amber-300">
                          Origen {articulo.problemaOrigenId}
                        </span>
                      </>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      articulo.origen === 'Problema N2'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {articulo.origen}
                  </span>
                </div>

                <h3 className="font-display text-base font-semibold text-slate-100">
                  {articulo.titulo}
                </h3>

                <div className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs space-y-1.5">
                  <p className="text-slate-400">
                    <strong className="text-slate-200">Síntoma:</strong>{' '}
                    {articulo.sintoma}
                  </p>
                  <p className="leading-relaxed text-slate-200">
                    <strong className="text-blue-300">Procedimiento:</strong>{' '}
                    {articulo.procedimiento}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/70 pt-3 text-[11px] text-slate-400">
                <span className="font-mono truncate">
                  Keywords:{' '}
                  <span className="text-slate-300">
                    {articulo.keywords.join(', ')}
                  </span>
                  {coincidencias.length > 0 && (
                    <span className="ml-2 text-emerald-400">
                      (Coincide: {coincidencias.join(', ')})
                    </span>
                  )}
                </span>
                <span className="font-mono tabular-nums text-emerald-400 whitespace-nowrap shrink-0">
                  {articulo.usosFcr} FCR logrados
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
