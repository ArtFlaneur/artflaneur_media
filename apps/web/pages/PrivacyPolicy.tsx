import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black uppercase mb-12 border-b-4 border-black pb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none font-mono text-sm leading-relaxed space-y-8">
          
          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Introduction</h2>
            <p>
              Art Flaneur is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mobile app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Collection of Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> We collect personal information you provide, such as your name, email address, and any other details necessary for subscribing to our services or contacting us.</li>
              <li><strong>Automatic Data:</strong> We automatically collect data like IP address, browser type, and usage patterns through cookies and similar technologies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Use of Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and manage our services.</li>
              <li>Communicate with you about updates, offers, and promotions.</li>
              <li>Improve our services through research and analysis.</li>
              <li>Ensure compliance with legal requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Disclosure of Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers assisting in our operations.</li>
              <li>Legal entities when required by law.</li>
              <li>With your consent for specific purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Cookies and Tracking Technologies</h2>
            <p>We use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enhance user experience.</li>
              <li>Track and analyse usage patterns.</li>
              <li>Deliver personalised content and advertisements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Third-Party Services and Data Sharing</h2>
            <p>We share your data with the following third-party services to provide our app functionality:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>AWS Location Services (Amazon Web Services)</strong> - We use AWS to process and store location data for geofencing, notifications, and location-based recommendations. Location data is transmitted to and stored on AWS servers which may be located outside Australia.</li>
              <li><strong>Firebase Analytics (Google)</strong> - We use Google Firebase to collect and analyse app usage data, including screen views, user interactions, search queries, and app performance metrics. This data helps us improve the app experience.</li>
            </ul>
            <p className="mt-4">These third-party services have their own privacy policies and data handling practices. We recommend reviewing their privacy policies for details on how they handle your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Analytics and App Data Collection</h2>
            <p>In addition to the information mentioned above, we collect detailed analytics data including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Screen views and navigation patterns within the app</li>
              <li>Search queries and search results</li>
              <li>User interaction events (button taps, menu selections, etc.)</li>
              <li>App performance data and error reports</li>
              <li>Device identifiers for analytics purposes</li>
              <li>Session duration and frequency of app usage</li>
            </ul>
            <p className="mt-4">This data is collected to improve app functionality, user experience, and to provide personalised content recommendations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">File Storage and Processing</h2>
            <p>Our app processes and stores certain data locally on your device:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Image files downloaded for offline viewing of gallery information</li>
              <li>Cached content to improve app performance and reduce data usage</li>
              <li>Temporary files necessary for app functionality</li>
              <li>User preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Background Data Collection</h2>
            <p>Location data may be collected when the app is running in the background to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide timely push notifications when you're near galleries with current exhibitions</li>
              <li>Maintain location-based services for accurate recommendations</li>
              <li>Enable geofencing features that alert you to nearby cultural venues</li>
            </ul>
            <p className="mt-4">You can disable background location access through your device settings, though this may limit some notification features.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Data Retention</h2>
            <p>We retain different types of data for varying periods:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Location Data:</strong> Retained for up to 2 years or until you request deletion</li>
              <li><strong>User Account Information:</strong> Retained while your account is active and for 30 days after account deletion</li>
              <li><strong>Analytics Data:</strong> Retained according to Firebase's standard retention policy (up to 14 months)</li>
              <li><strong>Cached Images and App Data:</strong> Stored locally until you uninstall the app or clear app data</li>
              <li><strong>AWS Location Services Data:</strong> Retained according to AWS's data retention policies</li>
            </ul>
            <p className="mt-4">You can request deletion of your personal data at any time by contacting us at <a href="mailto:info@artflaneur.com.au" className="text-art-blue underline">info@artflaneur.com.au</a>. We will process deletion requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Location Data Control</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can enable or disable location access through your device settings</li>
              <li>You can request to view, modify, or delete your location data</li>
              <li>Disabling location access may limit certain app features like venue recommendations and navigation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Data Security</h2>
            <p>
              We implement security measures to protect your data from unauthorised access, alteration, or disclosure. However, no method of transmission over the Internet or electronic storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Access and Control</h2>
            <p>
              You can access, update, or delete your personal information by contacting us at <a href="mailto:info@artflaneur.com.au" className="text-art-blue underline">info@artflaneur.com.au</a>. You may also opt out of marketing communications at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page.
            </p>
          </section>

          <section className="border-t-2 border-black pt-8 mt-12">
            <h2 className="text-2xl font-black uppercase mb-4">Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please get in touch with us at:
            </p>
            <p className="mt-4">
              Email: <a href="mailto:info@artflaneur.com.au" className="text-art-blue underline font-bold">info@artflaneur.com.au</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
