'use client';
import HeroBanner from './(components)/landingPage/HeroBanner';
import CollectionSlider, { features } from './(components)/landingPage/CollectionSlider';
import HowItWorks from './(components)/landingPage/HowItWorks';
import BlogPost from './(components)/landingPage/BlogPost';
import CreateWebsite from './(components)/landingPage/CreateWebsite';
import ClientLogo, { logos } from './(components)/landingPage/ClientLogo';
import Review from './(components)/landingPage/Review';
import { landingContent, blogs } from './admin/constants';
console.log(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  'process.envprocess.envprocess.envprocess.envprocess.envprocess.envprocess.envprocess.envprocess.envprocess.envprocess.env'
);
export default function Home() {
  return (
    <div className=" w-full flex flex-col">
      <HeroBanner />
      <CollectionSlider features={features} />
      <HowItWorks
        heading={landingContent.howItWorksHeading}
        step1Title={landingContent.howItWorksStep1Title}
        step1Desc={landingContent.howItWorksStep1Desc}
        step2Title={landingContent.howItWorksStep2Title}
        step2Desc={landingContent.howItWorksStep2Desc}
        step3Title={landingContent.howItWorksStep3Title}
        bgImage={landingContent.howItWorksBgImage}
      />
      <BlogPost
        blogs={blogs}
        sectionHeading={landingContent.blogSectionHeading}
        mainButtonLabel={landingContent.blogSectionButtonLabel}
        mainButtonLink={landingContent.blogSectionButtonLink}
      />
      <CreateWebsite backgroundImage={landingContent.weddingWebsiteSectionBgImage} />
      <ClientLogo logos={logos} />
      <Review heading={landingContent.reviewHeading} />
    </div>
  );
}
