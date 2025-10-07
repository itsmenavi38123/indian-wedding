import {
  UpdateSection2Input,
  updateSection2Schema,
} from '@/validators/landingPage/updateLandingPage';

export function handleSection2(body: any, mediaFiles: Record<string, string>, existingData: any) {
  if (body && typeof body.body === 'string') {
    try {
      body = JSON.parse(body.body);
    } catch (err) {
      console.error('Failed to parse nested body JSON', err);
      throw err;
    }
  }

  const parsedData: UpdateSection2Input = updateSection2Schema.parse(body);
  console.log('Received mediaFiles:', mediaFiles);
  console.log('Raw body received:', body);

  const updatedHeader = parsedData.header ?? existingData.header;

  const existingCards = existingData.cards ?? [];

  const cardsArray = parsedData.cards
    ? Object.keys(parsedData.cards)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => parsedData.cards![key])
    : [];
  console.log('Starting to update cards', { existingCards, cardsArray, mediaFiles });

  const updatedCards = existingCards.map((oldCard: any, idx: number) => {
    if (!cardsArray[idx]) {
      return oldCard;
    }

    const updatedCard = { ...oldCard, ...cardsArray[idx] };

    updatedCard.imagePath = mediaFiles[`card${idx}`] ?? updatedCard.imagePath;

    console.log(`card${idx} image file:`, mediaFiles[`card${idx}`]);

    return updatedCard;
  });

  if (cardsArray.length > existingCards.length) {
    for (let i = existingCards.length; i < cardsArray.length; i++) {
      const newCard = cardsArray[i];
      if (newCard) {
        updatedCards.push({
          ...newCard,
          imagePath: mediaFiles[`card${i}`] ?? newCard.imagePath,
        });
      }
    }
  }

  const content = {
    header: updatedHeader,
    cards: updatedCards,
  };

  console.log('Final content to save:', JSON.stringify(content, null, 2));

  return { content };
}
