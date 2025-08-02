export interface LinkItem {
  label?: string; // For navigation and legal
  name?: string; // For social links
  url: string;
  icon?: string;
}

export interface Section {
  title: string;
  items?: LinkItem[]; // Can contain either `label` or `name`
  email?: string;
  phone?: string;
}

export const contents: Section[] = [
  {
    title: 'Navigation',
    items: [
      { label: 'Home', url: '' },
      { label: 'About', url: '' },
      // { label: 'FAQ', url: '' },
      // { label: 'Help Centre', url: '' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', url: '' },
      // { label: 'Terms of Service', url: '' },
      // { label: 'Cookie Preferences', url: '' },
      // { label: 'Corporate Information', url: '' },
    ],
  },
  {
    title: 'Contact Us',
    email: 'ccpchannel@culturalcenter.gov.ph',
    phone: '(02) 8832 1125 loc 1511',
  },
  {
    title: 'Follow Us',
    items: [
      { name: 'Facebook', icon: 'fa-brands fa-facebook', url: '' },
      { name: 'Instagram', icon: 'fa-brands fa-instagram', url: '' },
      { name: 'Twitter', icon: 'fa-brands fa-twitter', url: '' },
    ],
  },
];

export const aboutDetails = [
  {
    title: 'ABOUT',
    description:
      'The CCP Channel is a nationwide streaming platform that offers the CCP’s quality and exclusive content in a celebration of local arts and culture while pushing local and international awareness of the Center’s programs, world-class artists, and creative endeavors. From live theater performances to award-winning independent films, a curated collection of exclusive and original CCP productions awaits discovery.',
    landscapeImageUrl: 'cinemalaya.jpg',
  },
];
