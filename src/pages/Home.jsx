import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { sundayServicesService, activitiesService, celebrationsService } from '@/services';
import HeroSection from '@/components/home/HeroSection';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import ActivityHighlights from '@/components/home/ActivityHighlights';
import CelebrationWall from '@/components/home/CelebrationWall';
import PrayerMeetingTeaser from '@/components/home/PrayerMeetingTeaser';
import ServiceHistory from '@/components/home/ServiceHistory';

export default function Home() {
  const { data: upcomingService } = useQuery({
    queryKey: ['upcoming-service'],
    queryFn: () => sundayServicesService.getUpcoming(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => sundayServicesService.list(),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesService.list(),
  });

  const { data: celebrations = [] } = useQuery({
    queryKey: ['celebrations'],
    queryFn: () => celebrationsService.getThisMonth(),
  });

  return (
    <main>
      {/* 1. Next Sunday's Message */}
      <HeroSection nextService={upcomingService} />

      {/* 2. Upcoming Events — weekly schedule */}
      <UpcomingEvents />

      {/* 3. Church Activities */}
      <ActivityHighlights activities={activities} />

      {/* 4. Recent Messages */}
      <ServiceHistory services={services} />

      {/* 5. Celebrations */}
      <CelebrationWall celebrations={celebrations} />

      {/* 6. Cellgroup */}
      <PrayerMeetingTeaser />
    </main>
  );
}