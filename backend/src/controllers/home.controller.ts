import { Request, Response } from 'express';
import prisma from '@/config/prisma';
import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/logger';
import { errorMessages, successMessages, statusCodes } from '@/constant';
import { File as MulterFile } from 'multer';
import { handleUploads } from '@/utils/landingPageHelpers';
import { handleSection1 } from '@/sections/section1';
import { handleSection2 } from '@/sections/section2';
import { handleSection3 } from '@/sections/section3';
import { handleSection4 } from '@/sections/section4';
import { handleSection5 } from '@/sections/section5';
import { handleSection6 } from '@/sections/section6';
import { JsonObject } from '@prisma/client/runtime/library';

export class LandingPageController {
  public async updateSection(req: Request, res: Response) {
    console.log(
      '🚀 updateSection hit with params:',
      req.params,
      'body keys:',
      Object.keys(req.body)
    );

    try {
      const sectionKey = req.params.sectionKey;
      const uploadedFiles: MulterFile[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files || {}).flat();

      const mediaFiles = await handleUploads(uploadedFiles, sectionKey);

      const existingSection = await prisma.homepage_sections.findUnique({
        where: { section_key: sectionKey },
      });

      function ensureJsonObject(value: any): JsonObject {
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      }

      let mergedContent: JsonObject = ensureJsonObject(existingSection?.content);
      const existingContent: JsonObject = ensureJsonObject(existingSection?.content);

      switch (sectionKey) {
        case 'section1':
          mergedContent = {
            ...mergedContent,
            ...handleSection1(req.body, mediaFiles).content,
          };
          break;
        // case 'section2':

        //   mergedContent = {
        //     ...existingSection?.content,
        //     ...handleSection2(req.body, mediaFiles, existingSection?.content).content,
        //   };
        //   break;
        case 'section2':
          mergedContent = {
            ...ensureJsonObject(existingSection?.content),
            ...handleSection2(req.body, mediaFiles, ensureJsonObject(existingSection?.content))
              .content,
          };
          break;
        case 'section3':
          mergedContent = {
            ...mergedContent,
            ...(await handleSection3(req.body, mediaFiles)).content,
          };
          break;
        case 'section4':
          if (!req.body.body) {
            return res.status(400).json({ message: 'Missing body for Section 4' });
          }
          const section4Body = JSON.parse(req.body.body);
          console.log('📢 Calling handleSection4 with:', req.body.body, mediaFiles, mergedContent);
          mergedContent = {
            ...mergedContent,
            ...handleSection4(section4Body, mediaFiles, mergedContent).content,
          };
          break;

        case 'section5':
          if (!req.body) {
            return res.status(400).json({ message: 'Missing body for Section 5' });
          }
          mergedContent = {
            ...mergedContent,
            ...handleSection5(req.body, mediaFiles, mergedContent).content,
          };
          break;
        case 'section6':
          mergedContent = {
            ...mergedContent,
            ...handleSection6(req.body, mediaFiles).content,
          };
          break;
        default:
          return res.status(400).json(new ApiResponse(400, null, 'Invalid section key'));
      }
      console.log('📢 Final mergedContent to save:', JSON.stringify(mergedContent, null, 2));

      if (existingSection) {
        await prisma.homepage_sections.update({
          where: { section_key: sectionKey },
          data: { content: mergedContent },
        });
      } else {
        await prisma.homepage_sections.create({
          data: { section_key: sectionKey, content: mergedContent },
        });
      }

      return res
        .status(statusCodes.OK)
        .json(new ApiResponse(statusCodes.OK, mergedContent, successMessages.UPDATE_SUCCESS));
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res
          .status(400)
          .json(new ApiResponse(400, null, error.errors.map((e: any) => e.message).join(', ')));
      }
      logger.error('Error updating homepage section:', error);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(
          new ApiResponse(statusCodes.INTERNAL_SERVER_ERROR, null, errorMessages.UPDATE_FAILED)
        );
    }
  }
}
