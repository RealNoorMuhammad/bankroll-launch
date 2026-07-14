import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import ContractAddress from '../components/ContractAddress'
import Lore from '../components/Lore'
import HowToBuy from '../components/HowToBuy'
import Gallery from '../components/Gallery'
import BeforeFooter from '../components/BeforeFooter'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div id="top">
      <Hero />
      <Marquee />
      <ContractAddress />
      <Lore />
      <HowToBuy />
      <Gallery />
      <div id="chart">
        <BeforeFooter />
      </div>
      <Footer />
    </div>
  )
}
