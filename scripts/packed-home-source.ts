import type { Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function packedSourceModule(original: Record<string, unknown>, sourceName: string, entryNodes?: Map<string, unknown>): string {
  const tokens: string[] = [], indexes = new Map<string, number>()
  const shapes: string[][] = [], shapeIndexes = new Map<string, number>()
  function pack(value: unknown): unknown {
    if (Array.isArray(value)) return [-1, ...value.map(pack)]
    if (!value || typeof value !== 'object') return value
    const id = (value as { id?: string }).id
    // Share only byte-identical entry subtrees. Deferred roots keep the full
    // original hierarchy after restoration, including their child references.
    if (id && entryNodes?.has(id) && JSON.stringify(entryNodes.get(id)) === JSON.stringify(value)) return [-3, id]
    const keys = Object.keys(value), shapeKey = JSON.stringify(keys)
    if (!shapeIndexes.has(shapeKey)) { shapeIndexes.set(shapeKey, shapes.length); shapes.push(keys) }
    return [shapeIndexes.get(shapeKey)!, ...Object.entries(value).map(([key, item]) =>
      (key === 'css' || key === 'layoutCss') && typeof item === 'string'
        ? [-2, ...item.split(';').map(token => {
          if (!indexes.has(token)) { indexes.set(token, tokens.length); tokens.push(token) }
          return indexes.get(token)!
        })] : pack(item),
    )]
  }
  const packed = pack(original)
  // Repeated object keys are a significant part of the parsed source.
  // Store each exact property order once, with explicit array/CSS tags so
  // no source value is mistaken for an encoding marker. The browser still
  // receives the same ordinary source objects as the development build.
  const restore = `function restore(value){if(!Array.isArray(value))return value;const kind=value[0];${entryNodes ? 'if(kind===-3)return entryNodes.get(value[1]);' : ''}if(kind===-2)return value.slice(1).map(index=>tokens[index]).join(';');if(kind===-1)return value.slice(1).map(restore);const result={};shapes[kind].forEach((key,index)=>{result[key]=restore(value[index+1])});return result}`
  // Every byte of every style and every non-style field must survive.
  const restored = new Function('tokens', 'shapes', 'entryNodes', `${restore};return restore(${JSON.stringify(packed)})`)(tokens, shapes, entryNodes)
  if (JSON.stringify(restored) !== JSON.stringify(original)) throw new Error(`Source packing changed the Design handoff: ${sourceName}`)
  const named = Object.keys(original).filter(key => /^[A-Za-z_$][\w$]*$/.test(key)).map(key => `export const ${key}=data[${JSON.stringify(key)}];`).join('')
  const entryImport = entryNodes ? `import entry from 'virtual:huanyu-home-entry';const entryNodes=new Map();function indexEntry(node){entryNodes.set(node.id,node);node.children.forEach(indexEntry)};[...entry.desktop,...entry.mobile].forEach(indexEntry);` : ''
  return `${entryImport}const [tokens,shapes,packed]=JSON.parse(${JSON.stringify(JSON.stringify([tokens, shapes, packed]))});${restore};const data=restore(packed);${named}export default data;`
}

/** Lossless transport encoding; the immutable Design handoff is never edited. */
export function packedHomeSourcePlugin(rewriteAssets: (code: string) => string = code => code): Plugin {
  let images = new Map<string, string>()
  const entryNodes = new Map<string, unknown>()
  return {
    name: 'huanyu-packed-figma-sources',
    apply: 'build',
    enforce: 'post',
    buildStart() {
      const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../public/image-optimization.json', import.meta.url)), 'utf8'))
      images = new Map(manifest.images.map((image: { source: string; optimizedSource: string }) => [image.source, image.optimizedSource]))
      const root = fileURLToPath(new URL('../docs/figma-source/home/', import.meta.url))
      const selected = new Set(['1412:5718', '1412:6672', '1528:117', '1528:127', '1528:148', '1528:806'])
      for (const file of ['source-tree-2026-10-19.json', 'source-tree-mobile-2026-10-19.json']) {
        const source = JSON.parse(rewriteAssets(readFileSync(`${root}${file}`, 'utf8').replace(/\/images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)(?=["'`)\s\\])/g, url => images.get(url) || url)))
        const walk = (node: { id: string; children: typeof node[] }) => {
          if (selected.has(node.id)) entryNodes.set(node.id, node)
          else node.children.forEach(walk)
        }
        walk(source.root)
      }
    },
    transform(_code, id) {
      if (!/\/docs\/figma-source\/home\/(?:.+\/)?source-trees?-.*\.json$/.test(id)
        && !/\/docs\/figma-source\/dental-revision-2026-10-28\/.+\/source-tree-.*\.json$/.test(id)
        && !id.endsWith('/docs/figma-source/dental-complete-2026-10-30/source-extension.json')) return
      // Apply the same release image mapping before encoding the original
      // JSON, so the late transform cannot restore an uncompressed image.
      const json = readFileSync(id, 'utf8').replace(/\/images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)(?=["'`)\s\\])/g,
        url => images.get(url) || url)
      const original = JSON.parse(rewriteAssets(json))
      const sharesEntry = /\/home\/source-tree(?:-mobile)?-2026-10-19\.json$/.test(id)
      return { code: packedSourceModule(original, id, sharesEntry ? entryNodes : undefined), map: null }
    },
  }
}

/** Exact source subtrees needed before the homepage's first paint. */
export function homeEntrySourcePlugin(rewriteAssets: (code: string) => string = code => code): Plugin {
  const moduleId = 'virtual:huanyu-home-entry'
  const root = fileURLToPath(new URL('../docs/figma-source/home/', import.meta.url))
  return {
    name: 'huanyu-home-entry-source',
    resolveId(id) { if (id === moduleId) return `\0${moduleId}` },
    load(id) {
      if (id !== `\0${moduleId}`) return
      type Node = { id: string; height: number; children: Node[] }
      const sources: { desktop: Node[]; mobile: Node[] } = { desktop: [], mobile: [] }
      const project = (file: string, viewport: keyof typeof sources, ids?: string[]) => {
        const path = `${root}${file}`
        this.addWatchFile(path)
        const source = JSON.parse(readFileSync(path, 'utf8')) as { root: Node }
        if (!ids) { sources[viewport].push(source.root); return }
        const remaining = new Set(ids)
        const walk = (node: Node) => {
          if (remaining.delete(node.id)) sources[viewport].push(node)
          else node.children.forEach(walk)
        }
        walk(source.root)
        if (remaining.size) throw new Error(`Missing homepage entry source: ${[...remaining].join(', ')}`)
      }
      project('source-tree-2026-10-19.json', 'desktop', ['1412:5718', '1412:6672'])
      project('source-tree-mobile-2026-10-19.json', 'mobile', ['1528:117', '1528:127', '1528:148', '1528:806'])
      for (const name of ['hero-01', 'hero-02', 'hero-03']) project(`${name}/source-tree-2026-10-19.json`, 'desktop')
      project('revision-2026-10-28/hero/source-tree-2026-10-28.json', 'desktop')
      project('navigation-mobile/source-tree-2026-10-19.json', 'mobile')
      project('navigation-mobile-language/source-tree-2026-10-19.json', 'mobile')
      const bodyNodes = new Map<string, Node>()
      const index = (node: Node) => { bodyNodes.set(node.id, node); node.children.forEach(index) }
      for (const file of ['source-tree-2026-10-19.json', 'journey-states/source-tree-2026-10-19.json']) {
        this.addWatchFile(`${root}${file}`)
        index(JSON.parse(readFileSync(`${root}${file}`, 'utf8')).root)
      }
      const bodyRoots = ['1412:5765','1401:18','1401:281','1401:49','1412:5853','1412:6019','1412:6055','1412:6092','1412:6313','1412:6350','1442:343','1412:6495','1412:6635']
      // The authored FAQ answer is closed on entry. Reserve the same outer
      // height as the final accordion so late code cannot move the footer.
      const bodyHeight = bodyRoots.reduce((height, id) => height + bodyNodes.get(id)!.height, 0) - bodyNodes.get('1401:303')!.height
      const manifestPath = fileURLToPath(new URL('../public/image-optimization.json', import.meta.url))
      this.addWatchFile(manifestPath)
      const images = JSON.parse(readFileSync(manifestPath, 'utf8')).images as { source: string; optimizedSource: string }[]
      const mapping = new Map(images.map(image => [image.source, image.optimizedSource]))
      const json = JSON.stringify({ ...sources, bodyHeight }).replace(/\/images\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)(?=["'`)\s\\])/g,
        url => mapping.get(url) || url)
      return packedSourceModule(JSON.parse(rewriteAssets(json)), moduleId)
    },
  }
}
