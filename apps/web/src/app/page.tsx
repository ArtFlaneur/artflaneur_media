import {ChatbotTeaser} from "@/components/sections/chatbot-teaser";
import {GuideHighlight} from "@/components/sections/guide-highlight";
import {HeroFeature} from "@/components/sections/hero-feature";
import {LatestReviews} from "@/components/sections/latest-reviews";
import {PartnerStack} from "@/components/sections/partner-stack";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <HeroFeature />
      <LatestReviews />
      <GuideHighlight />
      <ChatbotTeaser />
      <PartnerStack />
    </div>
  );
}
