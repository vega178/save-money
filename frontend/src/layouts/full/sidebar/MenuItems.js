import {
  IconLayoutDashboard,  IconReceipt
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
  }
];

export default Menuitems;
