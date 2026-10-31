import Navigation from './Navigation';
import ScrollIndicator from './ScrollIndicator';
import Hero from './Hero';
import ProjectGrid from './ProjectGrid';
import About from './About';
import Experience from './Experience';
import Contact from './Contact';

export default function Home() {
  return (
    <>
      <Navigation />
      <ScrollIndicator />
      <Hero />
      <ProjectGrid />
      <About />
      <Experience />
      <Contact />
    </>
  );
}
