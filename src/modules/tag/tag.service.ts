import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schema/tag.schema';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(Tag.name)
    private tagModel: Model<TagDocument>,
  ) {}

  async create(createTagDto: CreateTagDto, uid?: string) {
    const tag = await this.tagModel.findOne({
      displayText: createTagDto.displayText,
    });
    if (!tag) {
      createTagDto.id = uuidv4();
      createTagDto.uid = uid;
      await this.tagModel.create(createTagDto);
    } else {
      tag.quotedCount += 1;
      await tag.save();
    }
  }

  async findByText(
    displayText: string,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; tags: Tag[] }> {
    const regex = new RegExp(displayText, 'i'); // Case-insensitive regex pattern for matching text
    const skip = (page - 1) * pageSize;

    const [tags, total] = await Promise.all([
      this.tagModel
        .find({ displayText: { $regex: regex } })
        .skip(skip)
        .limit(pageSize),
      this.tagModel.countDocuments({ displayText: { $regex: regex } }),
    ]);

    return { tags, total };
  }
}
