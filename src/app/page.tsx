import Hero from '@/components/hero/Hero'
import Timeline from '@/components/timeline/Timeline'
import Gallery from '@/components/gallery/Gallery'
import Anecdotes from '@/components/anecdotes/Anecdotes'
import Crew from '@/components/crew/Crew'
import FutureLetter from '@/components/future/FutureLetter'

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black selection:bg-white selection:text-black overflow-x-hidden">
      <Hero/>
      <Timeline />
      <Gallery />
      <Anecdotes />
      <Crew />
      <FutureLetter />
    </main>
  );
}
