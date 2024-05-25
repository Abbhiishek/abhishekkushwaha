import { Aclonica, Acme, ADLaM_Display } from "next/font/google";


export const adlam_display = ADLaM_Display({
    weight: '400',
    subsets: ['adlam', 'latin', 'latin-ext']
});

export const aclonica = Aclonica({
    weight: '400',
    subsets: ['latin']
});


export const acme = Acme({
    weight: '400',
    subsets: ['latin']
});