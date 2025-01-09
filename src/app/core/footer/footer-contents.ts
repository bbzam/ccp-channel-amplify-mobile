interface LinkItem {
  label?: string; // For navigation and legal
  name?: string;  // For social links
  url: string;
  icon?: string;
}

interface Section {
  title: string;
  items?: LinkItem[]; // Can contain either `label` or `name`
  email?: string;
  phone?: string;
}

export const contents: Section[] = [
  {
    title: 'Navigation',
    items: [
      { label: 'Home', url: '/' },
      { label: 'FAQ', url: '/faq' },
      { label: 'About Us', url: '/about' },
      { label: 'Help Centre', url: '/help' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', url: '/privacy-policy' },
      { label: 'Terms of Service', url: '/terms-of-service' },
      { label: 'Cookie Preferences', url: '/cookie-preferences' },
      { label: 'Corporate Information', url: '/corporate-info' },
    ],
  },
  {
    title: 'Contact Us',
    email: 'support@ercom.com',
    phone: '+66 2399 1145',
  },
  {
    title: 'Follow Us',
    items: [
      { name: 'Facebook', icon: 'fa-brands fa-facebook', url: 'https://facebook.com/yourpage' },
      { name: 'Instagram', icon: 'fa-brands fa-instagram', url: 'https://twitter.com/yourpage' },
      { name: 'Twitter', icon: 'fa-brands fa-twitter', url: 'https://instagram.com/yourpage' },
    ],
  },
]