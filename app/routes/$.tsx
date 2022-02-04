import { useMemo } from 'react'
import { LoaderFunction, json, useLoaderData } from 'remix'
import { fs, fsp, path } from '~/utils/node.server'
import { bundleMDX } from '~/utils/mdx.server'
import { getMDXComponent } from 'mdx-bundler/client'
export const loader: LoaderFunction = async ({ request, params }) => {
  const slug = params['*']
  if (!slug) throw new Response('Not found', { status: 404 })

  let fullPath = path.join(process.cwd(), 'content', slug)
  console.log(fullPath)
  let postDir
  let mdxSource = ''
  let files = {}
  const exists = fs.existsSync(fullPath)
  if (exists && (await fsp.lstat(fullPath)).isDirectory()) {
    postDir = fullPath // need for bundling components
    const mdxPath = path.join(fullPath, 'index.mdx')
    mdxSource = await fsp.readFile(mdxPath, 'utf8')
    const mdxFiles = (await fsp.readdir(fullPath)).filter(
      filename => filename !== 'index.mdx',
    )
    const results = await Promise.all(
      mdxFiles.map(async filename =>
        fsp.readFile(`${fullPath}/${filename}`, 'utf8'),
      ),
    )
    files = Object.fromEntries(
      results.map((content, i) => [`./${mdxFiles[i]}`, content]),
    )
  } else {
    if (!fullPath.endsWith('.mdx')) fullPath += '.mdx'
    // verify file exists
    if (!fs.existsSync(fullPath))
      throw new Response('Not found', { status: 404 })
    mdxSource = await fsp.readFile(fullPath, 'utf8')
  }

  const { frontmatter, code } = await bundleMDX({
    source: mdxSource,
    files,
    cwd: postDir,
  })
  return json({ frontmatter, code })
}

export default function Post() {
  const { code, frontmatter } = useLoaderData()
  const Component = useMemo(() => getMDXComponent(code), [code])
  return (
    <>
      <h1>{frontmatter.title}</h1>
      <div className="space-y-20">
        <Component />
      </div>
    </>
  )
}
