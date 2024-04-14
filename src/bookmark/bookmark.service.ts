import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDTO, EditBookmarkDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({ where: { userId: userId } });
  }
  async createBookmark(userId: number, dto: CreateBookmarkDTO) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }
  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId: userId },
    });
  }
  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDTO,
  ) {
    // get bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }
  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // get bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });
    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resources denied');
    await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }
}
