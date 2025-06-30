// This automatically becomes your "/" route
import LandingPage from '../components/landing-page'

export default function HomePage() {
  return <LandingPage onGetStarted={() => window.location.hash = '#login'} />
}
