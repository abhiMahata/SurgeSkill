
import { Hero } from '../components/sections/Hero';
import { AppShowcase } from '../components/sections/AppShowcase';
import { FeaturesAlternating } from '../components/sections/FeaturesAlternating';
import { FeaturesBento } from '../components/sections/FeaturesBento';
import { Testimonial } from '../components/sections/Testimonial';
import { Pricing } from '../components/sections/Pricing';

export function Home() {
  return (
    <main>
      <Hero />
      <AppShowcase />
      <FeaturesAlternating />
      <FeaturesBento />
      <Testimonial />
      <Pricing />
    </main>
  );
}
