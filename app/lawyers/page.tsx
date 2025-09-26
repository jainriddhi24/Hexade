import { getLawyers } from './utils'
import { LawyersList } from './lawyers-list'

export const metadata = {
  title: 'Our Lawyers | Hexade Legal Portal',
  description: 'Browse through our network of qualified legal professionals. Find the right lawyer for your case.',
}

export default async function LawyersPage() {
  const lawyers = await getLawyers()
  return <LawyersList lawyers={lawyers} />
}