export interface ContentMetadata {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  userType: string;
  landscapeImageUrl: string;
  portraitImageUrl: string;
  previewVideoUrl: string;
  fullVideoUrl: string;
  runtime: number | undefined;
  resolution: string | undefined;
}
