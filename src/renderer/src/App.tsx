import React, { useEffect, useRef, useState } from 'react'
import * as esbuild from 'sucrase'
import ReactDOM from 'react-dom/client'

/**
 * JSX Editor & Live Preview
 * - No shadcn/ui, no @babel/standalone, no react-error-boundary, no framer-motion
 * - Uses esbuild-wasm to transform JSX → JS
 * - Plain HTML/CSS controls
 */

const DEFAULT_CODE = `// Write a React component and export default it.
// Click Run to transform & render.

function Counter(){
  const [n,setN] = React.useState(0)
  return (
    <div style={{padding:16}}>
      <h2>Counter: {n}</h2>
      <button onClick={()=>setN(n+1)}>+</button>
      <button onClick={()=>setN(n-1)} style={{marginLeft:8}}>-</button>
    </div>
  )
}

export default function App(){
  return (
    <main style={{fontFamily:'ui-sans-serif, system-ui', lineHeight:1.4}}>
      <h1>JSX Editor — Live</h1>
      <Counter />
    </main>
  )
}`

const DEFAULT_CSS = `:root { --brand: #4f46e5; }
* { box-sizing: border-box; }
button { background: var(--brand); color: #fff; border: 0; padding: 8px 12px; border-radius: 10px; }
button+button{ margin-left: 8px; }
textarea { width: 100%; font-family: JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
.panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.toolbar { display:flex; gap:8px; align-items:center; }
.badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #eef2ff; color: #3730a3; }
.error { white-space: pre-wrap; color: #991b1b; background:#fee2e2; border:1px solid #fecaca; padding:8px; border-radius:10px; }
`

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState]
}

export default function JSXEditorNoLibs() {
  const [code, setCode] = useLocalStorage('jsx:nolib:code', DEFAULT_CODE)
  const [css, setCss] = useLocalStorage('jsx:nolib:css', DEFAULT_CSS)
  const [status, setStatus] = useState('idle') // idle | ready | compiling | ok | error
  const [err, setErr] = useState('')
  const [compiledAt, setCompiledAt] = useState<number | null>(null)
  const rootRef = useRef<ReactDOM.Root | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // Initialize esbuild once
  useEffect(() => {
    ;(async () => {
      if (initialized.current) return
      try {
        setStatus('loading-esbuild')
        await esbuild.initialize({
          worker: true,
          wasmURL: 'https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm'
        })
        initialized.current = true
        setStatus('ready')
      } catch (e) {
        setErr(`Failed to initialize esbuild-wasm.\n${e}`)
        setStatus('error')
      }
    })()
  }, [])

  const compileAndRender = async () => {
    if (!initialized.current) return
    setStatus('compiling')
    setErr('')
    try {
      const result = await esbuild.transform(code, {
        loader: 'jsx',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        sourcemap: 'inline'
      })

      // Wrap result to expose default export
      const wrapped = `${result.code}\n;var __jsx_export__=(typeof exports!=='undefined'&&exports.default)?exports.default:(typeof App!=='undefined'?App:null);return { Component: __jsx_export__ };`
      const fn = new Function('React', 'exports', wrapped)
      const { Component } = fn(React, {})
      if (!Component)
        throw new Error('No default export found. Export a React component as default.')

      // Mount into preview
      if (previewRef.current) {
        if (!rootRef.current) {
          rootRef.current = ReactDOM.createRoot(previewRef.current)
        }
        rootRef.current.render(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('style', { dangerouslySetInnerHTML: { __html: css } }),
            React.createElement(Component, null)
          )
        )
      }

      setCompiledAt(Date.now())
      setStatus('ok')
    } catch (e) {
      setErr(String(e))
      setStatus('error')
    }
  }

  const resetAll = () => {
    setCode(DEFAULT_CODE)
    setCss(DEFAULT_CSS)
    setErr('')
    setCompiledAt(null)
    setStatus('ready')
    if (rootRef.current && previewRef.current) {
      rootRef.current.render(React.createElement('div', null))
    }
  }

  return (
    <div
      style={{ minHeight: '100vh', background: 'linear-gradient(#f8fafc, #ffffff)', padding: 16 }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            JSX Code Editor (No Babel/Framer/UI Kit)
          </h1>
          <div className="toolbar">
            <button
              onClick={compileAndRender}
              disabled={status.startsWith('loading') || status === 'compiling'}
            >
              {status === 'compiling' ? 'Compiling…' : 'Run'}
            </button>
            <button onClick={resetAll} style={{ background: '#e5e7eb', color: '#111827' }}>
              Reset
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Editor Panel */}
          <section className="panel" style={{ padding: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8
              }}
            >
              <strong>Editor (JSX)</strong>
              <span className="badge">{status === 'ready' ? 'ready' : status}</span>
            </div>
            <textarea rows={24} value={code} onChange={(e) => setCode(e.target.value)} />
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 4 }}>
                CSS
              </label>
              <textarea rows={8} value={css} onChange={(e) => setCss(e.target.value)} />
            </div>
          </section>

          {/* Preview Panel */}
          <section className="panel" style={{ padding: 12, position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8
              }}
            >
              <strong>Preview</strong>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {compiledAt
                  ? `Updated ${new Date(compiledAt).toLocaleTimeString()}`
                  : 'Waiting to run'}
              </span>
            </div>
            {err ? (
              <div className="error">{err}</div>
            ) : (
              <div ref={previewRef} style={{ minHeight: 200 }} />
            )}
          </section>
        </div>
      </div>
      <style>{DEFAULT_CSS}</style>
    </div>
  )
}
