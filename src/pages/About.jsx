import React from 'react';
import { motion } from 'framer-motion';
import { Church, BookOpen, Users, Globe, Heart, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PastorsSection from '@/components/pastors/PastorsSection';
import OrgChart from '@/components/about/OrgChart';
import { siteSettingsService } from '@/services';

const timeline = [
  { year: 'Founding', title: 'The Beginning', description: 'Consolacion Alliance Church was established as a local congregation under the Christian and Missionary Alliance Churches of the Philippines, Inc. (CAMACOP), rooted in the Great Commission to make disciples of all nations.' },
  { year: 'Growth', title: 'Growing in Faith', description: 'Through faithful ministry and community outreach, the church grew steadily, welcoming families from across Consolacion and surrounding areas. Bible studies, prayer meetings, and fellowship became the heartbeat of the congregation.' },
  { year: 'Mission', title: 'Reaching the Nations', description: "Aligned with CAMACOP's missionary vision, the church began supporting local and international mission efforts, sending teams for evangelism and discipleship throughout the Visayas region and beyond." },
  { year: 'Today', title: 'A Living Community', description: 'Today, Consolacion Alliance Church continues to serve as a beacon of hope — with vibrant youth ministry, active men and women\'s groups, worship teams, and community outreach programs touching lives every week.' },
];

const values = [
  { icon: BookOpen, title: 'Biblical Authority', description: 'We hold the Bible as the inspired, infallible Word of God — our ultimate guide for faith and practice.' },
  { icon: Users, title: 'Community', description: "We believe in doing life together — bearing one another's burdens and celebrating each other's victories." },
  { icon: Globe, title: 'Missions', description: 'Following the Great Commission, we are committed to reaching the lost both locally and globally.' },
  { icon: Heart, title: 'Compassion', description: 'We serve our neighbors with the love of Christ, meeting both spiritual and practical needs.' },
  { icon: Star, title: 'Worship', description: 'We worship God in spirit and truth, honoring Him in all areas of our lives.' },
  { icon: Church, title: 'Discipleship', description: 'We are committed to growing believers into mature followers of Jesus Christ.' },
];

export default function About() {
  const { data: images = {} } = useQuery({
    queryKey: ['about-images'],
    queryFn: () => siteSettingsService.getMany(['about_hero_image', 'about_fellowship_image']),
  });

  const heroImage = images.about_hero_image;
  const fellowshipImage = images.about_fellowship_image;

  return (
    <div className="min-h-screen pb-24 pt-28">

      {/* Hero */}
      <section className="relative mb-24 overflow-hidden h-80">
        {heroImage ? (
          <img src={heroImage} alt="Church history" className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-foreground/30" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Heritage Vault</p>
              <h1 className="text-4xl font-bold font-heading sm:text-5xl text-foreground">Our Story</h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About CAMACOP */}
      <section className="px-6 mb-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-center mx-auto mb-6 overflow-hidden rounded-full w-28 h-28 bg-primary/10">
              <img src="/CACLogo.jpg" alt="Church Logo" className="object-cover w-full h-full" />
            </div>
            <h2 className="mb-6 text-3xl font-bold font-heading text-foreground">About CAMACOP</h2>
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              The Christian and Missionary Alliance Churches of the Philippines, Inc. (CAMACOP) is a denomination
              committed to the deeper life in Christ and the global mission of proclaiming the Gospel.
              With hundreds of local churches across the Philippines, CAMACOP is a vibrant family of believers
              united by the fourfold gospel: Christ our Savior, Sanctifier, Healer, and Coming King.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Consolacion Alliance Church is proud to be part of this heritage, carrying forward the Alliance
              mission of reaching the lost, planting churches, and developing leaders for the glory of God.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-24 mb-24 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-16 text-3xl font-bold text-center font-heading text-foreground">
            Our Journey of Faith
          </motion.h2>
          <div className="relative">
            <div className="absolute top-0 bottom-0 hidden w-px left-8 bg-border md:block" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative md:pl-20">
                  <div className="absolute items-center justify-center hidden w-6 h-6 rounded-full md:flex left-5 top-1 bg-primary">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </div>
                  <div className="p-8 border bg-card rounded-xl border-border">
                    <span className="text-sm font-semibold tracking-wider uppercase text-primary">{item.year}</span>
                    <h3 className="mt-2 mb-3 text-xl font-bold font-heading text-foreground">{item.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pastors */}
      <PastorsSection />

      {/* Org Chart */}
      <OrgChart />

      {/* Core Values */}
      <section className="px-6 mb-24">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-16 text-3xl font-bold text-center font-heading text-foreground">
            What We Believe
          </motion.h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((val, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center mx-auto mb-4 w-14 h-14 rounded-xl bg-primary/10">
                    <val.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-bold font-heading text-foreground">{val.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{val.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fellowship Image */}
      {fellowshipImage && (
        <section className="px-6">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <img src={fellowshipImage} alt="Church fellowship" className="object-cover w-full h-80" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}