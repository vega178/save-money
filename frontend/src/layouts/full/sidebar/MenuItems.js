import {
  IconLayoutDashboard,  IconReceipt, IconCalendar,
} from '@tabler/icons';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/dashboard',
  },
  {
    navlabel: true,
    subheader: 'Save Money',
  },
  {
    id: uniqueId(),
    title: 'Bills',
    icon: IconReceipt,
    href: '/bills',
  },
  {    id: uniqueId(),
    title: 'Birthdays',
    icon: IconCalendar,
    href: '/birthdays',
  },
];

export default Menuitems;
