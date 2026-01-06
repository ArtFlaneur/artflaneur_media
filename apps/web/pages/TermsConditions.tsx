import React from 'react';

export const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-black uppercase mb-12 border-b-4 border-black pb-6">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none font-mono text-sm leading-relaxed space-y-8">
          
          <section className="bg-gray-50 border-2 border-black p-6">
            <p className="font-bold">Art Flaneur Global Pty Ltd</p>
            <p>ACN 672 710 520</p>
            <p>Tel 0414 088 847</p>
          </section>

          <section>
            <p>
              These are the Terms and Conditions on which Art Flaneur permits users to access and use the Art Flaneur website located at <a href="https://www.artflaneur.art" className="text-art-blue underline">www.ArtFlaneur.art</a> (Site). Your access to and use of the site is subject to the Terms and Conditions and the Art Flaneur privacy policy. If you do not agree to these Terms and Conditions and the privacy policy, you must not use or access this Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Definitions and Terminology</h2>
            <p>In these terms and conditions:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li>a reference to "we", "us" and "our" (or any cognate expression) is a reference to Art Flaneur (ABN 45 188 109 330).</li>
              <li>a reference to "you" or "your" or "user" (or any cognate expression) is a reference to any person that accesses this website (including any hyperlink on this website) for any reason whatsoever;</li>
              <li>the singular includes the plural and vice versa;</li>
              <li>Headings are for convenience only and do not affect interpretation;</li>
              <li>other grammatical forms of defined words or expressions have corresponding meanings;</li>
              <li>a reference to a party to this document includes that party's successors and permitted assigns;</li>
              <li>a reference to a user, party or person includes an individual, company, legal entity or body of persons and words implying natural persons include partnerships, corporate bodies and associations;</li>
              <li>a reference to a deed, document or agreement includes that deed, document or agreement as novated, amended, altered or replaced;</li>
              <li>a reference to anything includes the whole or any part of that thing and a reference to a group of things or persons includes each thing or person in that group;</li>
              <li>a reference to legislation or statutory instrument or a provision of any legislation or statutory instrument includes modifications or re-enactments of the legislation or statutory instrument, or any legislative or statutory provision substituted for, and all legislation and statutory instruments and regulations issued under the legislation; and</li>
              <li>an expression not otherwise defined in this document has the same meaning as in the Acts Interpretation Act 1901 (Cth) or the equivalent State legislation, as applicable; and</li>
              <li>the words "include", "including", "for example" or "such as" are not used as, nor is it to be interpreted as, a word of limitation and when introducing an example, do not limit the meaning of the words to which the example relates to that example or examples of a similar kind.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Copyright</h2>
            <p>
              Copyright in this website (including text, graphics, logos, icons, sound recordings and software) is owned by or licensed to us. Other than for the purposes of, and subject to the conditions prescribed under, the Copyright Act 1968 (Cth) and similar legislation which applies in your location, and except as expressly authorised by these terms and conditions, you may not in any form or by any means:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-4">
              <li>adapt, reproduce, store, distribute, print, display, perform, publish or create derivative works from any part of this website; or</li>
              <li>commercialise any information obtained from any part of this website, without our consent.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Trade Marks</h2>
            <ol className="list-decimal pl-6 space-y-3 mt-4">
              <li>Except where otherwise specified, any word or device to which is attached the ™ or ® symbol is a registered trade mark.</li>
              <li>If you use any of our trade marks in reference to our activities, products or services, you must include a statement attributing that trade mark to us. You must not use any of our trademarks:
                <ol className="list-[lower-alpha] pl-6 mt-2 space-y-1">
                  <li>in or as the whole or part of your own trademarks;</li>
                  <li>in connection with activities, products or services which are not ours;</li>
                  <li>in a manner which may be confusing, misleading or deceptive; in a manner that disparages us or our information, products or services (including this website).</li>
                </ol>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Linked Websites</h2>
            <ol className="list-decimal pl-6 space-y-3 mt-4">
              <li>This website may contain links to other websites. Those links are provided for convenience only and may not remain current or be maintained. We are not responsible for the content or privacy practices associated with linked websites.</li>
              <li>Our links with linked websites should not be construed as an endorsement, approval or recommendation by us of the owners or operators of those linked websites (and vice versa), or of any information, graphics, materials, products or services referred to or contained on those linked websites, unless and to the extent expressly stated to the contrary in this website.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Governing Law</h2>
            <p>
              These terms and conditions are governed by the laws in force in Victoria, Australia. In using this site, you agree to submit to the non-exclusive jurisdiction of the courts of Victoria, Australia (and any court of appeal) and you waive any right to object to an action being brought in those courts, including on the basis of an inconvenient forum or those courts not having jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Severability</h2>
            <p>
              A provision of these terms and conditions that is illegal, invalid or unenforceable in a jurisdiction is ineffective in that jurisdiction to the extent of the illegality, invalidity or unenforceability. This does not affect the validity or enforceability of that provision in any other jurisdiction, nor the remainder of this document in any jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase mb-4">Interpretation</h2>
            <p>
              No rule of construction applies to the disadvantage of a party because that party was responsible for the preparation of, or seeks to rely on, these terms and conditions or any part of it.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
