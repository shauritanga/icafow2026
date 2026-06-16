import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { About } from "@/components/sections/about";
import { ThematicAreas } from "@/components/sections/thematic-areas";
import { WhyAttend } from "@/components/sections/why-attend";
import { Registration } from "@/components/sections/registration";
import { Exhibition } from "@/components/sections/exhibition";
import { Sponsorship } from "@/components/sections/sponsorship";
import { Partners } from "@/components/sections/partners";
import { Speakers } from "@/components/sections/speakers";
import { Pitch } from "@/components/sections/pitch";
import { Contact } from "@/components/sections/contact";

// Section order mirrors the source content document (ICAFoW 2026_Web Contents):
// About · Thematic Areas · Why Attend · Register · Exhibit Now · Sponsors ·
// Partners · Speakers · Pitch · Contact.
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
        <About />
        <ThematicAreas />
        <WhyAttend />
        <Registration />
        <Exhibition />
        <Sponsorship />
        <Partners />
        <Speakers />
        <Pitch />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
