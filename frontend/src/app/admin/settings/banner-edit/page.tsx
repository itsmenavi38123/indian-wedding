'use client';

import React, { useState } from 'react';
import CollectionSlider, { Feature } from '@/app/(components)/landingPage/CollectionSlider';
import HeroBanner from '@/app/(components)/landingPage/HeroBanner';
import { useUpdateSection2, useUpdateSection3, useUpdateSection6 } from '@/hooks/use-landingpage';
import BlogPost, { Blog } from '@/app/(components)/landingPage/BlogPost';
import { updateSection4, updateSection5 } from '@/services/api/landingPage';
import CreateWebsite from '@/app/(components)/landingPage/CreateWebsite';
import ClientLogo from '@/app/(components)/landingPage/ClientLogo';
import { logos as initialLogos } from '@/app/(components)/landingPage/ClientLogo';
import Review from '@/app/(components)/landingPage/Review';
import HowItWorks from '@/app/(components)/landingPage/HowItWorks';
import SectionCard from './section-layout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { blogs, initialFeatures, landingContent } from '../../constants';

function base64ToFile(base64: string, filename: string) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const BannerEditPage: React.FC = () => {
  const router = useRouter();
  const updateSection2Mutation = useUpdateSection2();
  const updateSection6Mutation = useUpdateSection6();
  const updateSection3Mutation = useUpdateSection3();

  // carousel section states
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [carouselSectionTitle, setCarouselSectionTitle] = useState(
    landingContent.carouselSectionTitle
  );
  const [cardImages, setCardImages] = useState<Record<number, File | null>>({});

  // how it works section states
  const [howItWorksSectionHeading, setHowItWorksSectionHeading] = useState(
    landingContent.howItWorksHeading
  );
  const [step1Title, setStep1Title] = useState(landingContent.howItWorksStep1Title);
  const [step1Desc, setStep1Desc] = useState(landingContent.howItWorksStep1Desc);
  const [step2Title, setStep2Title] = useState(landingContent.howItWorksStep2Title);
  const [step2Desc, setStep2Desc] = useState(landingContent.howItWorksStep2Desc);
  const [step3Title, setStep3Title] = useState(landingContent.howItWorksStep3Title);
  const [step3Desc, setStep3Desc] = useState(landingContent.howItWorksStep3Desc);
  const [bgImage, setBgImage] = useState<File | string>(landingContent.howItWorksBgImage);

  // blog section states
  const [sectionHeading, setSectionHeading] = useState(landingContent.blogSectionHeading);
  const [mainButtonLabel, setMainButtonLabel] = useState(landingContent.blogSectionButtonLabel);
  const [mainButtonLink, setMainButtonLink] = useState(landingContent.blogSectionButtonLink);
  const [localBlogs, setLocalBlogs] = useState<Blog[]>(blogs);

  // create website & brand logos section states
  const [section5Heading, setSection5Heading] = useState(
    landingContent.weddingWebsiteSectionHeading
  );
  const [section5Description, setSection5Description] = useState(
    landingContent.weddingWebsiteSectionDescription
  );
  const [section5ButtonLabel, setSection5ButtonLabel] = useState(
    landingContent.weddingWebsiteSectionButtonLabel
  );
  const [section5ButtonLink, setSection5ButtonLink] = useState(
    landingContent.weddingWebsiteSectionButtonLink
  );
  const [section5BackgroundImage, setSection5BackgroundImage] = useState<File | null | string>(
    landingContent.weddingWebsiteSectionBgImage
  );
  const [brandLogos, setBrandLogos] = useState<(string | File)[]>(initialLogos);
  const [section5BrandsHeading, setSection5BrandsHeading] = useState(
    landingContent.weddingWebsiteSectionBrandsHeading
  );
  const [section5BrandsParagraph, setSection5BrandsParagraph] = useState(
    landingContent.weddingWebsiteSectionBrandsParagraph
  );

  // review section states
  const [reviewHeading, setReviewHeading] = useState(landingContent.reviewHeading);

  // Handlers for saving each section

  const handleSaveSection2 = () => {
    const formData = new FormData();
    const cardsPayload = features.reduce<Record<string, any>>((acc, card, idx) => {
      acc[idx.toString()] = {
        title: card.title || '',
        link: card.link || '',
        imagePath: card.imagePath || '',
      };
      return acc;
    }, {});

    formData.append(
      'body',
      JSON.stringify({
        header: carouselSectionTitle,
        cards: cardsPayload,
      })
    );

    Object.entries(cardImages).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    updateSection2Mutation.mutate(formData);
  };

  const handleSaveSection3 = () => {
    const formData = new FormData();
    formData.append('header', howItWorksSectionHeading);
    const contentsPayload = [
      { heading: step1Title, paragraph: step1Desc },
      { heading: step2Title, paragraph: step2Desc },
      { heading: step3Title, paragraph: step3Desc },
    ];

    contentsPayload.forEach((content, idx) => {
      formData.append(`contents[${idx}][heading]`, content.heading);
      formData.append(`contents[${idx}][paragraph]`, content.paragraph);
    });
    if (bgImage) {
      if (bgImage instanceof File) {
        formData.append('bgImage', bgImage);
      } else if (typeof bgImage === 'string' && bgImage.startsWith('data:image')) {
        const file = base64ToFile(bgImage, 'bgImage.png');
        formData.append('bgImage', file);
      } else if (typeof bgImage === 'string' && bgImage.trim() !== '') {
        formData.append('bgImage', bgImage);
      }
    }

    updateSection3Mutation.mutate(formData);
  };

  const handleSaveSection4 = async (
    editedBlogs: Blog[],
    sectionHeading: string,
    mainButtonLabel: string,
    mainButtonLink: string
  ) => {
    try {
      const formData = new FormData();

      formData.append('header', sectionHeading);

      formData.append('button[label]', mainButtonLabel);
      formData.append('button[link]', mainButtonLink);
      formData.append('button[show]', 'true');

      editedBlogs.forEach((blog, idx) => {
        formData.append(`cards[${idx}][title1]`, blog.title || '');
        formData.append(`cards[${idx}][title2]`, blog.description || '');
        formData.append(`cards[${idx}][title3]`, '');
        formData.append(`cards[${idx}][readMore][label]`, 'Read More');
        formData.append(`cards[${idx}][readMore][link]`, blog.link || '#');

        if (blog.image instanceof File) {
          formData.append(`card${idx}`, blog.image);
        } else if (typeof blog.image === 'string') {
          formData.append(`cards[${idx}][imagePath]`, blog.image);
        }
      });

      const data = await updateSection4(formData);
      console.log('Section 4 saved successfully:', data);
    } catch (err) {
      console.error('Error saving Section 4:', err);
    }
  };

  const handleSaveSection5 = () => {
    const formData = new FormData();

    if (section5Heading) formData.append('header', section5Heading);
    if (section5BackgroundImage) formData.append('mainImage', section5BackgroundImage);
    if (section5Heading) formData.append('mainContent[heading]', section5Heading);
    if (section5Description) formData.append('mainContent[paragraph]', section5Description);
    if (section5ButtonLabel) formData.append('mainContent[button][label]', section5ButtonLabel);
    if (section5ButtonLink) formData.append('mainContent[button][link]', section5ButtonLink);
    formData.append('mainContent[button][show]', 'true');
    if (section5BrandsHeading) formData.append('brands[heading]', section5BrandsHeading);
    if (section5BrandsParagraph) formData.append('brands[paragraph]', section5BrandsParagraph);

    Object.entries(cardImages).forEach(([file]) => {
      if (file) {
        formData.append('brands[images][]', file);
      }
    });

    updateSection5(formData);
  };

  const handleSaveSection6 = () => {
    updateSection6Mutation.mutate({ heading: reviewHeading });
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Edit Template</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>

      {/* Edit  Section 1  */}
      <HeroBanner editable={true} />

      {/* Edit Section 2 */}
      <SectionCard onSave={handleSaveSection2}>
        <CollectionSlider
          features={features}
          setFeatures={setFeatures}
          title={carouselSectionTitle}
          setTitle={setCarouselSectionTitle}
          cardImages={cardImages}
          setCardImages={setCardImages}
          editable={true}
        />
      </SectionCard>

      {/* Edit Section 3*/}
      <SectionCard onSave={handleSaveSection3}>
        <HowItWorks
          editable={true}
          heading={howItWorksSectionHeading}
          setHeading={setHowItWorksSectionHeading}
          step1Title={step1Title}
          setStep1Title={setStep1Title}
          step1Desc={step1Desc}
          setStep1Desc={setStep1Desc}
          step2Title={step2Title}
          setStep2Title={setStep2Title}
          step2Desc={step2Desc}
          setStep2Desc={setStep2Desc}
          step3Title={step3Title}
          setStep3Title={setStep3Title}
          step3Desc={step3Desc}
          bgImage={bgImage}
          setBgImage={setBgImage}
          setStep3Desc={setStep3Desc}
        />
      </SectionCard>

      {/* Edit Section 4*/}
      <SectionCard
        onSave={() =>
          handleSaveSection4(localBlogs, sectionHeading, mainButtonLabel, mainButtonLink)
        }
      >
        <BlogPost
          blogs={localBlogs}
          editable={true}
          setBlogs={setLocalBlogs}
          cardImages={cardImages}
          setCardImages={setCardImages}
          sectionHeading={sectionHeading}
          setSectionHeading={setSectionHeading}
          mainButtonLabel={mainButtonLabel}
          setMainButtonLabel={setMainButtonLabel}
          mainButtonLink={mainButtonLink}
          setMainButtonLink={setMainButtonLink}
        />
      </SectionCard>

      {/* Edit Section 5  */}
      <SectionCard onSave={handleSaveSection5}>
        <CreateWebsite
          editable={true}
          heading={section5Heading}
          setHeading={setSection5Heading}
          description={section5Description}
          setDescription={setSection5Description}
          buttonLabel={section5ButtonLabel}
          setButtonLabel={setSection5ButtonLabel}
          buttonLink={section5ButtonLink}
          setButtonLink={setSection5ButtonLink}
          backgroundImage={section5BackgroundImage}
          setBackgroundImage={setSection5BackgroundImage}
        />

        <ClientLogo
          editable={true}
          setLogos={setBrandLogos}
          logos={brandLogos}
          heading={section5BrandsHeading}
          setHeading={setSection5BrandsHeading}
          paragraph={section5BrandsParagraph}
          setParagraph={setSection5BrandsParagraph}
        />
      </SectionCard>

      {/* Edit Section 6  */}
      <SectionCard onSave={handleSaveSection6}>
        <Review editable={true} heading={reviewHeading} setHeading={setReviewHeading} />
      </SectionCard>
    </div>
  );
};

export default BannerEditPage;
