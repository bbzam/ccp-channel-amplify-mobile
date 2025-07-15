export interface ContentMetadata {
  id?: any;
  title: string;
  description: string;
  category:
    | 'theater'
    | 'film'
    | 'music'
    | 'dance'
    | 'education'
    | 'ccpspecials'
    | 'ccpclassics';
  subCategory: string;
  director: string;
  writer: string;
  yearReleased: string;
  userType: 'free' | 'subscriber';
  landscapeImageUrl: string;
  portraitImageUrl: string;
  previewVideoUrl: string;
  fullVideoUrl: string;
  runtime: number;
  resolution: string;
  status: boolean;
  publishDate: string;
  customFields: any;
}
