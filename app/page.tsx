
import BentoGridHeroSection from '@/components/home/BentoGridSection';
import { Aclonica, ADLaM_Display } from 'next/font/google';

const adlam_display = ADLaM_Display({
  weight: '400',
  subsets: ['adlam', 'latin', 'latin-ext']
});

const aclonica = Aclonica({
  weight: '400',
  subsets: ['latin']
});


export default function Home() {
  return (
    <main className='grid place-content-start min-h-screen mt-10'>
      <BentoGridHeroSection />
    </main >
  );
}
