export const curatorNavItems = [
  {
    label: 'Dashboard',
    routeLink: '/content-curator/dashboard',
    icon: 'dashboard',
    expanded: false,
  },
  {
    label: 'Content',
    routeLink: '/content-curator/content',
    icon: 'article',
    expanded: false,
    children: [
      {
        label: 'Published',
        routeLink: '/content-curator/published',
        icon: 'check_circle',
      },
      {
        label: 'Scheduled',
        routeLink: '/content-curator/scheduled',
        icon: 'schedule',
      },
      {
        label: 'Set Featured',
        routeLink: '/content-curator/featured',
        icon: 'star',
      },
      {
        label: 'Set Tag',
        routeLink: '/content-curator/settag',
        icon: 'local_offer',
      },
      {
        label: 'Manage Tag',
        routeLink: '/content-curator/tag',
        icon: 'bookmark',
      },
      {
        label: 'Custom Fields',
        routeLink: '/content-curator/custom-fields',
        icon: 'tune',
      },
      // {
      //   label: 'Landing Page',
      //   routeLink: '/content-curator/configure-landing-page',
      //   icon: 'featured_video',
      // },
    ],
  },
  {
    label: 'View Users',
    routeLink: '/content-curator/manage-users',
    icon: 'person',
    expanded: false,
  },
];

export const itAdminNavItems = [
  {
    label: 'Dashboard',
    routeLink: '/it-admin/dashboard',
    icon: 'dashboard',
    expanded: false,
  },
  {
    label: 'Administration',
    routeLink: '/it-admin/admin',
    icon: 'admin_panel_settings',
    expanded: false,
    children: [
      {
        label: 'Manage Users',
        routeLink: '/it-admin/manage-users',
        icon: 'person',
      },
    ],
  },
];

export const superAdminNavItems = [
  {
    label: 'Dashboard',
    routeLink: '/super-admin/dashboard',
    icon: 'dashboard',
    expanded: false,
  },
  {
    label: 'Content',
    routeLink: '/super-admin/content',
    icon: 'article',
    expanded: false,
    children: [
      {
        label: 'Published',
        routeLink: '/super-admin/published',
        icon: 'check_circle',
      },
      {
        label: 'Scheduled',
        routeLink: '/super-admin/scheduled',
        icon: 'schedule',
      },
      {
        label: 'Set Featured',
        routeLink: '/super-admin/featured',
        icon: 'star',
      },
      {
        label: 'Set Tag',
        routeLink: '/super-admin/settag',
        icon: 'local_offer',
      },
      {
        label: 'Manage Tag',
        routeLink: '/super-admin/tag',
        icon: 'bookmark',
      },
      {
        label: 'Custom Fields',
        routeLink: '/super-admin/custom-fields',
        icon: 'tune',
      },
      // {
      //   label: 'Landing Page',
      //   routeLink: '/super-admin/configure-landing-page',
      //   icon: 'featured_video',
      // },
    ],
  },
  {
    label: 'Administration',
    routeLink: '/super-admin/admin',
    icon: 'admin_panel_settings',
    expanded: false,
    children: [
      {
        label: 'Manage Users',
        routeLink: '/super-admin/manage-users',
        icon: 'person',
      },
    ],
  },
];
