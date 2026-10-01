export interface ServiceDto {
	id: number;
	name: string;
	slug: string;
	shortDescription: string;
	description: string;
	price: number;
	metaTitle?: string | null;
	metaDescription?: string | null;
	imageUrl?: string | null;
	imageAlt?: string | null;
	canonicalUrl?: string | null;
	isIndexable: boolean;
	lastModified: Date;
	modifiedBy: string;
}
