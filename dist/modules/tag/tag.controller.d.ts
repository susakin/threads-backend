import { TagService } from './tag.service';
import { Tag } from './schema/tag.schema';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    findUsersByQuery(text: string, page: number, pageSize: number): Promise<{
        total: number;
        tags: Tag[];
    }>;
}
