import { PostMetaDto } from './post-meta.dto';
import { PostTagDto } from './post-tag.dto';

export interface CreatePostDetailsDto {
  title: string;
  metaTitle: string;
  slug: string;
  summary: string;
  content: string;
  postMetas: PostMetaDto[];
  postTags: PostTagDto[];
}