import React from 'react';

export const CookiesPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black uppercase mb-12 border-b-4 border-black pb-6">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none font-mono text-sm leading-relaxed space-y-8">
          
          <section>
            <h2 className="text-2xl font-black uppercase mb-4">What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">How We Use Cookies</h2>
            <p>Art Flaneur uses cookies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Improve your user experience</li>
              <li>Analyse website traffic and performance</li>
              <li>Deliver personalised content and advertisements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Types of Cookies We Use</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-art-yellow pl-6">
                <h3 className="text-xl font-black uppercase mb-2">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website. The website cannot function properly without these cookies.
                </p>
              </div>

              <div className="border-l-4 border-art-blue pl-6">
                <h3 className="text-xl font-black uppercase mb-2">Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve our website and services.
                </p>
                <p className="mt-2">
                  <strong>Services used:</strong> Google Analytics, Firebase Analytics
                </p>
              </div>

              <div className="border-l-4 border-art-red pl-6">
                <h3 className="text-xl font-black uppercase mb-2">Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalisation, such as remembering your preferences, language settings, and previous searches.
                </p>
              </div>

              <div className="border-l-4 border-black pl-6">
                <h3 className="text-xl font-black uppercase mb-2">Marketing Cookies</h3>
                <p>
                  These cookies track your browsing habits to deliver advertisements more relevant to you and your interests. They also limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service and deliver advertisements through the service. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Firebase:</strong> For app analytics and user engagement tracking</li>
              <li><strong>AWS:</strong> For location services and data processing</li>
              <li><strong>Social Media Platforms:</strong> For social sharing and integration features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Managing Cookies</h2>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
            </p>
            
            <div className="bg-gray-50 border-2 border-black p-6 mt-6">
              <h3 className="text-lg font-black uppercase mb-3">Browser Settings</h3>
              <p className="mb-3">You can manage cookies through your browser settings:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Cookie Consent</h2>
            <p>
              By using our website, you consent to the use of cookies in accordance with this Cookie Policy. When you first visit our website, you will be asked to consent to our use of cookies. You can withdraw your consent at any time by changing your browser settings or contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, our operations, or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies.
            </p>
          </section>

          <section className="border-t-2 border-black pt-8 mt-12">
            <h2 className="text-2xl font-black uppercase mb-4">Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
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
