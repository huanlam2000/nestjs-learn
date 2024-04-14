import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDTO, EditBookmarkDTO } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'huantyn@gmail.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw exception if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw exception if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw exception if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw exception if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw exception if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      const dto = {
        email: 'huantyn2905@gmail.com',
        firstName: 'Huan',
        lastName: 'Lam The',
      };
      it('should error if email not provided', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody({
            firstName: 'Huan',
            lastName: 'Lam The',
          })
          .expectStatus(400);
      });
      it('should edit user without first name', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody({
            email: 'huantyn2345@gmail.com',
            lastName: 'Lam The',
          })
          .expectStatus(200);
      });
      it('should edit user without last name', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody({
            email: 'huantyn2345@gmail.com',
            firstName: 'Huan',
          })
          .expectStatus(200);
      });
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName);
      });
    });
  });
  describe('Bookmarks', () => {
    const dto: CreateBookmarkDTO = {
      title: 'First bookmark',
      link: 'https://youtu.be/GHTA143_b-s',
    };
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe('Get bookmark by id', () => {
      it('should return a bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });
    describe('Edit bookmark', () => {
      const dto: EditBookmarkDTO = {
        title: 'NestJs Course for Beginners - Create a REST API',
        description:
          'Learn NestJs by building a CRUD REST API with end-to-end tests using modern web development techniques. NestJs is a rapidly growing node js framework that helps build scalable and maintainable backend applications.',
      };
      it('should edit a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .inspect();
      });
    });
    describe('Delete bookmark', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(204)
          .inspect();
      });
      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer ' + `$S{userAt}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
