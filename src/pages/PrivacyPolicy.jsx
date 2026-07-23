import React from 'react';
import { motion } from 'framer-motion';

const lastUpdated = 'July 2026';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 pb-24 pt-28">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Legal</p>
          <h1 className="mb-4 text-4xl font-bold font-heading sm:text-5xl text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </motion.div>

        <div className="space-y-10 leading-relaxed text-foreground/90">
          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">1. Who we are</h2>
            <p>
              This website is operated by Consolacion Alliance Church (CAMACOP), Upper Jugan, Consolacion, Cebu,
              Philippines. This policy explains what information we collect through this website, how we use it,
              and how you can reach us with questions or requests.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">2. Information we collect</h2>
            <p className="mb-2">We collect information you choose to give us directly through the site, including:</p>
            <ul className="pl-5 space-y-1 list-disc">
              <li>Prayer requests submitted through the Prayer Meeting / Prayer Request page (name and message, and whether you'd like it kept private)</li>
              <li>Messages you send through the Contact page (name, email, and your message)</li>
              <li>Account information for members with login access to member-only areas (name, email)</li>
              <li>Photos or media uploaded by members or administrators as part of church activities</li>
            </ul>
            <p className="mt-2">
              We do not knowingly collect information from children without a parent or guardian's involvement, and
              we do not use tracking cookies or advertising trackers on this site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">3. How we use your information</h2>
            <ul className="pl-5 space-y-1 list-disc">
              <li>To respond to messages and prayer requests</li>
              <li>To share prayer requests with our prayer team and, where you've indicated it's not private, the congregation</li>
              <li>To manage member accounts and church activities</li>
              <li>To keep the community informed about worship schedules, activities, and celebrations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">4. How your information is stored</h2>
            <p>
              Information submitted through this site is stored using Supabase, a third-party database and hosting
              provider, and the site itself is hosted on Vercel. Both providers process data on our behalf and
              maintain their own security safeguards. We take reasonable technical measures to protect the
              information you share with us, but no online system can be guaranteed 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">5. Sharing your information</h2>
            <p>
              We do not sell or rent your information to third parties. We only share information with the hosting
              and database providers named above, who help us run the site, and within the church (e.g., pastoral
              staff or the prayer team) where necessary to respond to your request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">6. Your choices</h2>
            <p>
              You can ask us to correct or delete information you've submitted — for example, a prayer request or
              contact message — at any time by reaching out using the details below. If you have a member account,
              you can request that it be updated or removed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">7. Changes to this policy</h2>
            <p>
              We may update this policy from time to time as the site changes. The "last updated" date at the top
              of this page will reflect the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold font-heading">8. Contact us</h2>
            <p>
              If you have questions about this policy or how your information is handled, please reach out to us at{' '}
              <a href="mailto:consolacionalliancechurch@gmail.com" className="text-primary hover:underline">
                consolacionalliancechurch@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}