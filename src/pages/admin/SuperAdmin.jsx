import React, { useState } from 'react';
import { Shield, Sun, Activity, Heart, BookOpen, Users, Video, UserCircle, GitBranch, Home, ImageIcon, Phone, IdCard } from 'lucide-react';
import SundayServiceAdmin from '@/components/admin/SundayServiceAdmin';
import ActivitiesAdmin from '@/components/admin/ActivitiesAdmin';
import CelebrationsAdmin from '@/components/admin/CelebrationsAdmin';
import SermonsAdmin from '@/components/admin/SermonsAdmin';
import PrayerRequestsAdmin from '@/components/admin/PrayerRequestsAdmin';
import VlogsAdmin from '@/components/admin/VlogsAdmin';
import PastorsAdmin from '@/components/admin/PastorsAdmin';
import OrgChartAdmin from '@/components/admin/OrgChartAdmin';
import CellgroupsAdmin from '@/components/admin/CellgroupsAdmin';
import AboutSettingsAdmin from '@/components/admin/AboutSettingsAdmin';
import ContactAdmin from '@/components/admin/ContactAdmin';
import MembersAdmin from '@/components/admin/MembersAdmin';

const TABS = [
  { value: 'sunday',       label: 'Sunday Service',  icon: Sun },
  { value: 'sermons',      label: 'Sermons',          icon: BookOpen },
  { value: 'activities',   label: 'Activities',       icon: Activity },
  { value: 'celebrations', label: 'Celebrations',     icon: Heart },
  { value: 'Blogs',        label: 'Blogs',            icon: Video },
  { value: 'cellgroups',   label: 'Cellgroups',       icon: Home },
  { value: 'prayer',       label: 'Prayer Requests',  icon: Users },
  { value: 'pastors',      label: 'Pastors',          icon: UserCircle },
  { value: 'orgchart',     label: 'Org Chart',        icon: GitBranch },
  { value: 'about',        label: 'About Images',     icon: ImageIcon },
  { value: 'contact',      label: 'Contact Info',     icon: Phone },
  { value: 'members',      label: 'Members',          icon: IdCard },
];

export default function SuperAdmin() {
  const [active, setActive] = useState('sunday');

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading sm:text-3xl text-foreground">Super Admin</h1>
            <p className="text-sm text-muted-foreground">Manage all church content from one place</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 p-1 mb-8 bg-muted rounded-xl">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setActive(value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${active === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div>
          {active === 'sunday'       && <SundayServiceAdmin />}
          {active === 'sermons'      && <SermonsAdmin />}
          {active === 'activities'   && <ActivitiesAdmin />}
          {active === 'celebrations' && <CelebrationsAdmin />}
          {active === 'Blogs'        && <VlogsAdmin />}
          {active === 'cellgroups'   && <CellgroupsAdmin />}
          {active === 'prayer'       && <PrayerRequestsAdmin />}
          {active === 'pastors'      && <PastorsAdmin />}
          {active === 'orgchart'     && <OrgChartAdmin />}
          {active === 'about'        && <AboutSettingsAdmin />}
          {active === 'contact'      && <ContactAdmin />}
          {active === 'members'      && <MembersAdmin />}
        </div>
      </div>
    </div>
  );
}