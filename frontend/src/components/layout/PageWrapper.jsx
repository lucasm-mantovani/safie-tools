import Navbar from './Navbar'
import Footer from './Footer'

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-safie-light">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
