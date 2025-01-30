export interface LinkItem {
  label?: string; // For navigation and legal
  name?: string;  // For social links
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
      { label: 'FAQ', url: '' },
      { label: 'Help Centre', url: '' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy Policy', url: '' },
      { label: 'Terms of Service', url: '' },
      { label: 'Cookie Preferences', url: '' },
      { label: 'Corporate Information', url: '' },
    ],
  },
  {
    title: 'Contact Us',
    email: '',
    phone: '',
  },
  {
    title: 'Follow Us',
    items: [
      { name: 'Facebook', icon: 'fa-brands fa-facebook', url: '' },
      { name: 'Instagram', icon: 'fa-brands fa-instagram', url: '' },
      { name: 'Twitter', icon: 'fa-brands fa-twitter', url: '' },
    ],
  },
]