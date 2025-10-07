import {
  UpdateSection6Input,
  updateSection6Schema,
} from '@/validators/landingPage/updateLandingPage';

export function handleSection6(body: any, mediaFiles: Record<string, string>) {
  const parsedData: UpdateSection6Input = updateSection6Schema.parse(body);

  const content: Record<string, any> = {};

  if (parsedData.heading !== undefined) content.heading = parsedData.heading;

  Object.assign(content, mediaFiles);

  return { content };
}
