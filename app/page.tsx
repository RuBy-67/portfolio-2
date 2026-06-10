import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Timeline } from "@/components/sections/Timeline";
import { Expertise } from "@/components/sections/Expertise";
import { AgentsPhilosophy } from "@/components/sections/AgentsPhilosophy";
import { BeyondCode } from "@/components/sections/BeyondCode";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Timeline />
        <Expertise />
        <AgentsPhilosophy />
        <BeyondCode />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
