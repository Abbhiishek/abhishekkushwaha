
import { cn } from '@/utils/cn';
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
    <main className="grid col-span-12 gap-4 h-screen place-content-center">
      <h1 className={cn(`lg:text-6xl text-center leading-7 text-xl`, adlam_display.className)}>Abhishek Kushwaha</h1>
      <p className={cn(`lg:text-xl text-base text-center`, aclonica.className)} >
        I &rsquo;m a software engineer who loves to build things.
      </p>
    </main >
  );
}
