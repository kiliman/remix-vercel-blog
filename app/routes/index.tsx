import { Link } from 'remix'

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <Link to="hello-world">Hello World</Link>
        </li>
        <li>
          <Link to="example">Example with Counter</Link>
        </li>
      </ul>
    </div>
  )
}
