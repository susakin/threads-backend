"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const tag_schema_1 = require("./schema/tag.schema");
const mongoose_2 = require("@nestjs/mongoose");
const uuid_1 = require("uuid");
let TagService = class TagService {
    constructor(tagModel) {
        this.tagModel = tagModel;
    }
    async create(createTagDto, uid) {
        const tag = await this.tagModel.findOne({
            displayText: createTagDto.displayText,
        });
        if (!tag) {
            createTagDto.id = (0, uuid_1.v4)();
            createTagDto.uid = uid;
            await this.tagModel.create(createTagDto);
        }
        else {
            tag.quotedCount += 1;
            await tag.save();
        }
    }
    async findByText(displayText, page, pageSize) {
        const regex = new RegExp(displayText, 'i');
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
};
exports.TagService = TagService;
exports.TagService = TagService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], TagService);
//# sourceMappingURL=tag.service.js.map