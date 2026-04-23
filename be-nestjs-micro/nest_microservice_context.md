# 🚀 Microservice Monorepo - NestJS + RMQ + Prisma + S3

## 🧱 Tổng quan kiến trúc

Hệ thống sử dụng:

- **NestJS Microservices (RMQ)**
- **Monorepo (apps + libs)**
- **Prisma (PostgreSQL)**
- **RabbitMQ (message broker)**
- **AWS S3 (media upload qua presigned URL)**

---

# 📁 Cấu trúc thư mục chuẩn

```txt
be-nestjs-micro/
│
├── apps/
│   ├── gateway/
│   │   └── src/
│   │       └── modules/
│   │           ├── auth-gateway/
│   │           │   └── auth/
│   │           │       ├── auth-gateway.module.ts
│   │           │       ├── auth-gateway.controller.ts
│   │           │       └── auth-gateway.service.ts
│   │           │
│   │           ├── catalog-gateway/
│   │           │   ├── catalog-gateway.module.ts
│   │           │   ├── catalog-rmq-client.module.ts
│   │           │   ├── category/
│   │           │   │   ├── category-catalog-gateway.module.ts
│   │           │   │   ├── category-catalog-gateway.controller.ts
│   │           │   │   └── category-catalog-gateway.service.ts
│   │           │   └── menu-item/
│   │           │       ├── menu-item-catalog-gateway.module.ts
│   │           │       ├── menu-item-catalog-gateway.controller.ts
│   │           │       └── menu-item-catalog-gateway.service.ts
│   │           │
│   │           └── media-gateway/
│   │               ├── media-gateway.module.ts
│   │               ├── media-gateway.controller.ts
│   │               └── media-gateway.service.ts
│   │
│   ├── iam-service/
│   │   └── src/modules/
│   │       └── auth/
│   │           ├── auth.module.ts
│   │           ├── auth.controller.ts
│   │           └── auth.service.ts
│   │
│   ├── catalog-service/
│   │   └── src/modules/
│   │       ├── category/
│   │       │   ├── category.module.ts
│   │       │   ├── category.controller.ts
│   │       │   └── category.service.ts
│   │       └── menu-item/
│   │           ├── menu-item.module.ts
│   │           ├── menu-item.controller.ts
│   │           └── menu-item.service.ts
│   │
│   ├── media-service/
│   │   └── src/modules/
│   │       └── media/
│   │           ├── media.module.ts
│   │           ├── media.controller.ts
│   │           └── media.service.ts
│   │
│   ├── ordering-service/
│   ├── dinein-service/
│   ├── payment-service/
│   ├── notification-service/
│   └── review-service/
│
├── libs/
│   ├── common/
│   │   └── src/
│   │       ├── constants/
│   │       │   └── error.constant.ts
│   │       ├── exceptions/
│   │       │   └── app-rpc.exception.ts
│   │       ├── filters/
│   │       │   ├── global-exception.filter.ts
│   │       │   └── global-rpc-exception.filter.ts
│   │       ├── interfaces/
│   │       │   └── rpc-error-payload.interface.ts
│   │       ├── interceptors/
│   │       │   └── response.interceptor.ts
│   │       ├── rmq/
│   │       │   └── rpc-message.helper.ts
│   │       └── utils/
│   │           └── rpc-error.util.ts
│   │
│   ├── contracts/
│   │   └── src/
│   │       ├── iam/
│   │       │   └── auth/
│   │       │       ├── commands/
│   │       │       └── results/
│   │       ├── catalog/
│   │       │   ├── category/
│   │       │   │   ├── commands/
│   │       │   │   ├── queries/
│   │       │   │   └── results/
│   │       │   └── menu-item/
│   │       │       ├── commands/
│   │       │       ├── queries/
│   │       │       └── results/
│   │       └── media/
│   │           ├── commands/
│   │           └── results/
│   │
│   ├── messaging/
│   │   └── src/
│   │       ├── constants/
│   │       │   ├── patterns.constant.ts
│   │       │   ├── queues.constant.ts
│   │       │   └── services.constants.ts
│   │       └── messaging-clients.module.ts
│   │
│   ├── database/
│   │   └── src/
│   │       ├── catalog-prisma.service.ts
│   │       ├── iam-prisma.service.ts
│   │       └── ...
│   │
│   ├── config/
│   │   └── src/
│   │       ├── media/
│   │       │   └── media.config.ts
│   │       └── index.ts
│   │
│   └── auth/
│       └── src/
│           ├── jwt.service.ts
│           └── interfaces/
│
├── prisma/
│   ├── iam/
│   ├── catalog/
│   ├── ordering/
│   ├── media/
│   └── ...
│
└── docker-compose.yml
```

---

# 🔄 Luồng xử lý chính

## 1. Gateway → Microservice

- Gateway nhận HTTP request
- Validate bằng `RequestDto`
- Map sang `Command` hoặc `Query`
- Gửi qua RMQ bằng `ClientProxy.send(...)`
- Microservice xử lý nghiệp vụ
- Trả về `Result`
- Gateway map lỗi RPC sang HTTP exception
- Global interceptor bọc response chuẩn

---

## 2. Media upload (S3)

### Flow chuẩn hiện tại

1. Client gọi `POST /api/v1/media/upload-url`
2. Gateway gửi `CreateUploadUrlCommand` sang media-service
3. Media-service trả về:
   - `uploadUrl`
   - `publicUrl`
   - `key`
   - `bucket`
   - `region`
   - `expiresIn`
4. Client dùng `PUT` trực tiếp lên `uploadUrl`
5. Client gửi `publicUrl` hoặc `key` khi tạo resource

### Ghi chú

- `POST /media/upload-url` **không upload file**
- request upload thực lên S3 phải dùng **`PUT` + binary body**
- không dùng `form-data` ở bước upload bằng presigned URL

---

# 🧠 Quy ước DTO / Command / Query / Result

## Gateway HTTP

- `request.dto.ts`
- `response.dto.ts`

## Contracts nội bộ

- `*.command.ts`
- `*.query.ts`
- `*.result.ts`

## Microservice

- nhận `command/query`
- trả `result`

---

# 📌 Rule về kiểu dữ liệu

## DTO

Dùng `class`

- bắt buộc: `!`
- optional: `?`

Ví dụ:

```ts
export class CreateCategoryRequestDto {
  name!: string;
  slug!: string;
  description?: string;
}
```

## Command / Query / Result

Ưu tiên dùng `interface`

- bắt buộc: `field: type`
- optional: `field?: type`
- nullable từ DB: `field: string | null`

Ví dụ:

```ts
export interface CreateCategoryCommand {
  name: string;
  slug: string;
  description?: string;
}
```

---

# 📨 RMQ Patterns

Tất cả đặt tại:

```txt
libs/messaging/src/constants/patterns.constant.ts
```

Ví dụ:

```ts
export const IAM_PATTERNS = {
  LOGIN: 'iam.auth.login',
  REGISTER: 'iam.auth.register',
  REFRESH: 'iam.auth.refresh',
  GET_PROFILE: 'iam.auth.get_profile',
};

export const CATALOG_PATTERNS = {
  CREATE_CATEGORY: 'catalog.category.create',
  LIST_CATEGORIES: 'catalog.category.list',
  GET_CATEGORY_DETAIL: 'catalog.category.get_detail',

  CREATE_MENU_ITEM: 'catalog.menu_item.create',
};

export const MEDIA_PATTERNS = {
  CREATE_UPLOAD_URL: 'media.create_upload_url',
  ATTACH_FILE: 'media.attach_file',
};
```

---

# ⚙️ RMQ Queues / Services

## `queues.constant.ts`

```ts
export const RMQ_QUEUES = {
  IAM: 'iam_queue',
  CATALOG: 'catalog_queue',
  MEDIA: 'media_queue',
  ORDERING: 'ordering_queue',
  DINEIN: 'dinein_queue',
  PAYMENT: 'payment_queue',
  NOTIFICATION: 'notification_queue',
  REVIEW: 'review_queue',
} as const;
```

## `services.constants.ts`

```ts
export const RMQ_SERVICES = {
  IAM: 'IAM_SERVICE',
  CATALOG: 'CATALOG_SERVICE',
  MEDIA: 'MEDIA_SERVICE',
  ORDERING: 'ORDERING_SERVICE',
  DINEIN: 'DINEIN_SERVICE',
  PAYMENT: 'PAYMENT_SERVICE',
  NOTIFICATION: 'NOTIFICATION_SERVICE',
  REVIEW: 'REVIEW_SERVICE',
} as const;
```

---

# 🧩 Rule module cho Gateway + RMQ client

## Nguyên tắc

- module feature gateway inject `ClientProxy` thì phải import module cấp client đó
- không đặt provider RMQ ở module cha rồi để module con dùng gián tiếp

## Cấu trúc đúng cho catalog gateway

```txt
catalog-gateway/
  catalog-gateway.module.ts
  catalog-rmq-client.module.ts
  category/
    category-catalog-gateway.module.ts
    category-catalog-gateway.controller.ts
    category-catalog-gateway.service.ts
  menu-item/
    menu-item-catalog-gateway.module.ts
    menu-item-catalog-gateway.controller.ts
    menu-item-catalog-gateway.service.ts
```

## `catalog-rmq-client.module.ts`

```ts
@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.CATALOG,
        queue: RMQ_QUEUES.CATALOG,
      },
    ]),
  ],
  exports: [MessagingClientsModule],
})
export class CatalogRmqClientModule {}
```

## `category-catalog-gateway.module.ts`

```ts
@Module({
  imports: [CatalogRmqClientModule],
  controllers: [CategoryCatalogGatewayController],
  providers: [CategoryCatalogGatewayService],
})
export class CategoryCatalogGatewayModule {}
```

## `menu-item-catalog-gateway.module.ts`

```ts
@Module({
  imports: [CatalogRmqClientModule],
  controllers: [MenuItemCatalogGatewayController],
  providers: [MenuItemCatalogGatewayService],
})
export class MenuItemCatalogGatewayModule {}
```

## `catalog-gateway.module.ts`

```ts
@Module({
  imports: [CategoryCatalogGatewayModule, MenuItemCatalogGatewayModule],
})
export class CatalogGatewayModule {}
```

---

# 🌐 Gateway main.ts

## Quy ước bootstrap

```ts
const app = await NestFactory.create(GatewayModule);

app.setGlobalPrefix('api/v1');

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

app.enableCors({
  origin: true,
  credentials: true,
});

app.useGlobalInterceptors(new ResponseInterceptor());
app.useGlobalFilters(new GlobalExceptionFilter());

const port = Number(process.env.PORT ?? 3000);
await app.listen(port);
```

---

# 🛡️ Error Handling chuẩn mới

## File dùng chung

```txt
libs/common/src/constants/error.constant.ts
```

## Cấu trúc error

Mỗi lỗi có:

- `code`
- `message`
- `statusCode`

### `error.constant.ts`

```ts
export interface ErrorDefinition {
  code: string;
  message: string;
  statusCode: 400 | 401 | 403 | 404 | 409 | 500;
}

type ErrorGroup = Record<string, ErrorDefinition>;
type ExtractErrorCode<T extends ErrorGroup> = T[keyof T]['code'];

export const ERROR_DEFINITIONS = {
  common: {
    VALIDATION_ERROR: {
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu không hợp lệ',
      statusCode: 400,
    },
    BAD_REQUEST: {
      code: 'BAD_REQUEST',
      message: 'Yêu cầu không hợp lệ',
      statusCode: 400,
    },
    UNAUTHORIZED: {
      code: 'UNAUTHORIZED',
      message: 'Chưa được xác thực',
      statusCode: 401,
    },
    FORBIDDEN: {
      code: 'FORBIDDEN',
      message: 'Bạn không có quyền thực hiện thao tác này',
      statusCode: 403,
    },
    NOT_FOUND: {
      code: 'NOT_FOUND',
      message: 'Không tìm thấy dữ liệu',
      statusCode: 404,
    },
    CONFLICT: {
      code: 'CONFLICT',
      message: 'Dữ liệu bị xung đột',
      statusCode: 409,
    },
    INTERNAL_ERROR: {
      code: 'INTERNAL_ERROR',
      message: 'Lỗi hệ thống',
      statusCode: 500,
    },
  },

  iam: {
    AUTH_INVALID_CREDENTIALS: {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email hoặc mật khẩu không đúng',
      statusCode: 401,
    },
    AUTH_UNAUTHORIZED: {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Bạn chưa được xác thực',
      statusCode: 401,
    },
    AUTH_TOKEN_INVALID: {
      code: 'AUTH_TOKEN_INVALID',
      message: 'Token không hợp lệ',
      statusCode: 401,
    },
    AUTH_TOKEN_EXPIRED: {
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Token đã hết hạn',
      statusCode: 401,
    },
    USER_NOT_FOUND: {
      code: 'USER_NOT_FOUND',
      message: 'Không tìm thấy người dùng',
      statusCode: 404,
    },
    USER_EMAIL_ALREADY_EXISTS: {
      code: 'USER_EMAIL_ALREADY_EXISTS',
      message: 'Email đã tồn tại',
      statusCode: 409,
    },
    USER_PHONE_ALREADY_EXISTS: {
      code: 'USER_PHONE_ALREADY_EXISTS',
      message: 'Số điện thoại đã tồn tại',
      statusCode: 409,
    },
    USER_ACCOUNT_DISABLED: {
      code: 'USER_ACCOUNT_DISABLED',
      message: 'Tài khoản đã bị vô hiệu hóa',
      statusCode: 403,
    },
  },

  catalog: {
    CATEGORY_NOT_FOUND: {
      code: 'CATEGORY_NOT_FOUND',
      message: 'Không tìm thấy danh mục',
      statusCode: 404,
    },
    CATEGORY_SLUG_ALREADY_EXISTS: {
      code: 'CATEGORY_SLUG_ALREADY_EXISTS',
      message: 'Slug danh mục đã tồn tại',
      statusCode: 409,
    },
    CATEGORY_NAME_ALREADY_EXISTS: {
      code: 'CATEGORY_NAME_ALREADY_EXISTS',
      message: 'Tên danh mục đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_NOT_FOUND: {
      code: 'MENU_ITEM_NOT_FOUND',
      message: 'Không tìm thấy món ăn',
      statusCode: 404,
    },
    MENU_ITEM_SLUG_ALREADY_EXISTS: {
      code: 'MENU_ITEM_SLUG_ALREADY_EXISTS',
      message: 'Slug món ăn đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_SKU_ALREADY_EXISTS: {
      code: 'MENU_ITEM_SKU_ALREADY_EXISTS',
      message: 'SKU món ăn đã tồn tại',
      statusCode: 409,
    },
    MENU_ITEM_CATEGORY_NOT_FOUND: {
      code: 'MENU_ITEM_CATEGORY_NOT_FOUND',
      message: 'Danh mục của món ăn không tồn tại',
      statusCode: 404,
    },
  },

  media: {
    MEDIA_NOT_FOUND: {
      code: 'MEDIA_NOT_FOUND',
      message: 'Không tìm thấy tệp tin',
      statusCode: 404,
    },
    MEDIA_FILE_TYPE_NOT_SUPPORTED: {
      code: 'MEDIA_FILE_TYPE_NOT_SUPPORTED',
      message: 'Loại file không được hỗ trợ',
      statusCode: 400,
    },
    MEDIA_FILE_TOO_LARGE: {
      code: 'MEDIA_FILE_TOO_LARGE',
      message: 'Kích thước file vượt quá giới hạn cho phép',
      statusCode: 400,
    },
    MEDIA_UPLOAD_FAILED: {
      code: 'MEDIA_UPLOAD_FAILED',
      message: 'Upload file thất bại',
      statusCode: 500,
    },
    MEDIA_DELETE_FAILED: {
      code: 'MEDIA_DELETE_FAILED',
      message: 'Xóa file thất bại',
      statusCode: 500,
    },
    MEDIA_ACCESS_DENIED: {
      code: 'MEDIA_ACCESS_DENIED',
      message: 'Bạn không có quyền truy cập tệp tin này',
      statusCode: 403,
    },
  },
} as const;

export const ERRORS = {
  ...ERROR_DEFINITIONS.common,
  ...ERROR_DEFINITIONS.iam,
  ...ERROR_DEFINITIONS.catalog,
  ...ERROR_DEFINITIONS.media,
} as const;

export type CommonErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.common>;
export type IamErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.iam>;
export type CatalogErrorCode = ExtractErrorCode<
  typeof ERROR_DEFINITIONS.catalog
>;
export type MediaErrorCode = ExtractErrorCode<typeof ERROR_DEFINITIONS.media>;

export type ErrorCode =
  | CommonErrorCode
  | IamErrorCode
  | CatalogErrorCode
  | MediaErrorCode;

export const ERROR_CODE_MAP = Object.values(ERRORS).reduce<
  Record<string, ErrorDefinition>
>((acc, errorDef) => {
  acc[errorDef.code] = errorDef;
  return acc;
}, {});

export function getErrorDefinition(code: string): ErrorDefinition {
  return ERROR_CODE_MAP[code] ?? ERRORS.INTERNAL_ERROR;
}
```

---

# 🧾 RpcErrorPayload

```ts
export interface RpcErrorPayload {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
```

---

# 🚨 AppRpcException

```ts
export class AppRpcException extends RpcException {
  constructor(payload: RpcErrorPayload) {
    super(payload);
  }
}
```

---

# 🔁 RPC error util

## `rpc-error.util.ts`

```ts
export function extractRpcError(error: unknown): RpcErrorPayload {
  if (typeof error === 'object' && error !== null) {
    const maybeWrapped = error as { error?: unknown };

    const candidate =
      typeof maybeWrapped.error === 'object' && maybeWrapped.error !== null
        ? (maybeWrapped.error as Partial<RpcErrorPayload>)
        : (error as Partial<RpcErrorPayload>);

    return {
      code:
        typeof candidate.code === 'string'
          ? (candidate.code as ErrorCode)
          : ERRORS.INTERNAL_ERROR.code,
      message:
        typeof candidate.message === 'string'
          ? candidate.message
          : ERRORS.INTERNAL_ERROR.message,
      details: candidate.details,
    };
  }

  return {
    code: ERRORS.INTERNAL_ERROR.code,
    message: ERRORS.INTERNAL_ERROR.message,
  };
}

export function mapRpcErrorToHttpException(error: unknown): Error {
  const rpcError = extractRpcError(error);
  const definition = getErrorDefinition(rpcError.code);

  const body = {
    code: rpcError.code,
    message: rpcError.message || definition.message,
    details: rpcError.details,
  };

  switch (definition.statusCode) {
    case 400:
      return new BadRequestException(body);
    case 401:
      return new UnauthorizedException(body);
    case 403:
      return new ForbiddenException(body);
    case 404:
      return new NotFoundException(body);
    case 409:
      return new ConflictException(body);
    default:
      return new InternalServerErrorException(body);
  }
}
```

---

# 🧯 GlobalExceptionFilter

## HTTP filter

```ts
function mapHttpStatusToDefaultErrorCode(status: HttpStatus): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ERRORS.VALIDATION_ERROR.code;
    case HttpStatus.UNAUTHORIZED:
      return ERRORS.AUTH_UNAUTHORIZED.code;
    case HttpStatus.FORBIDDEN:
      return ERRORS.FORBIDDEN.code;
    case HttpStatus.NOT_FOUND:
      return ERRORS.NOT_FOUND.code;
    case HttpStatus.CONFLICT:
      return ERRORS.CONFLICT.code;
    default:
      return ERRORS.INTERNAL_ERROR.code;
  }
}
```

Response chuẩn:

```json
{
  "success": false,
  "error": {
    "code": "CATEGORY_SLUG_ALREADY_EXISTS",
    "message": "Slug danh mục đã tồn tại",
    "details": null
  },
  "meta": {
    "timestamp": "...",
    "path": "/api/v1/category"
  }
}
```

---

# 📡 GlobalRpcExceptionFilter

Microservice RPC filter trả lỗi chuẩn:

```json
{
  "code": "CATEGORY_SLUG_ALREADY_EXISTS",
  "message": "Slug danh mục đã tồn tại",
  "details": null
}
```

Gateway dùng `catchError(...)` để map sang `HttpException`.

---

# 🧱 Rule bắt lỗi ở Gateway Service

Mọi gateway service gọi RMQ nên dùng:

```ts
return firstValueFrom(
  this.client
    .send<TResult, TCommand>(PATTERN, command)
    .pipe(
      catchError((error: unknown) =>
        throwError(() => mapRpcErrorToHttpException(error)),
      ),
    ),
);
```

---

# 🔐 IAM Service

## AuthGatewayService

- HTTP nhận `LoginRequestDto`, `RegisterRequestDto`
- map sang `LoginCommandDto`, `RegisterCommandDto`
- gửi RMQ bằng `IAM_PATTERNS.LOGIN`, `IAM_PATTERNS.REGISTER`
- `catchError(...)` map lỗi RPC sang HTTP

## AuthService

Dùng:

- `ERRORS.AUTH_INVALID_CREDENTIALS.code`
- `ERRORS.USER_EMAIL_ALREADY_EXISTS.code`
- `ERRORS.AUTH_UNAUTHORIZED.code`
- `ERRORS.USER_NOT_FOUND.code`

Ví dụ:

```ts
throw new AppRpcException({
  code: ERRORS.AUTH_INVALID_CREDENTIALS.code,
  message: ERRORS.AUTH_INVALID_CREDENTIALS.message,
});
```

---

# 📚 Catalog Gateway

## Category gateway controller

```ts
@Controller('category')
export class CategoryCatalogGatewayController {
  constructor(
    private readonly categoryCatalogService: CategoryCatalogGatewayService,
  ) {}

  @Post()
  create(@Body() dto: CreateCategoryRequestDto) {
    return this.categoryCatalogService.create(dto);
  }
}
```

## Category gateway service

- inject `@Inject(RMQ_SERVICES.CATALOG)`
- map `CreateCategoryRequestDto -> CreateCategoryCommand`
- gọi `CATALOG_PATTERNS.CREATE_CATEGORY`
- bắt lỗi bằng `mapRpcErrorToHttpException`

## Menu-item gateway

### route

```txt
POST /api/v1/menu-items
```

### file

- `menu-item-catalog-gateway.controller.ts`
- `menu-item-catalog-gateway.module.ts`
- `menu-item-catalog-gateway.service.ts`

### flow

- HTTP nhận `CreateMenuItemRequestDto`
- map sang `CreateMenuItemCommand`
- gửi `CATALOG_PATTERNS.CREATE_MENU_ITEM`
- trả `MenuItemDetailResult`

---

# 🏷️ Catalog Service - Category

## `category.controller.ts`

```ts
@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern(CATALOG_PATTERNS.CREATE_CATEGORY)
  create(
    @Payload() command: CreateCategoryCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.categoryService.create(command),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.GET_CATEGORY_DETAIL)
  findOne(
    @Payload() query: GetCategoryDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.categoryService.findOne(query.id),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.LIST_CATEGORIES)
  findAll(@Payload() query: ListCategoriesQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.categoryService.findAll(query));
  }
}
```

## `category.service.ts`

- kiểm tra slug trùng → `ERRORS.CATEGORY_SLUG_ALREADY_EXISTS`
- kiểm tra name trùng → `ERRORS.CATEGORY_NAME_ALREADY_EXISTS`
- không tìm thấy → `ERRORS.CATEGORY_NOT_FOUND`
- map Prisma entity sang `CategoryDetailResult`
- chuyển `Date -> ISO string`

---

# 🍽️ Catalog Service - Menu Item

## `menu-item.controller.ts`

```ts
@Controller()
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @MessagePattern(CATALOG_PATTERNS.CREATE_MENU_ITEM)
  create(
    @Payload() command: CreateMenuItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.create(command),
    );
  }
}
```

## `menu-item.service.ts`

### nghiệp vụ hiện tại

- kiểm tra `categoryId` tồn tại
- kiểm tra `slug` trùng
- tạo menu item
- map entity từ Prisma sang `MenuItemDetailResult`

### error dùng

- `ERRORS.MENU_ITEM_CATEGORY_NOT_FOUND`
- `ERRORS.MENU_ITEM_SLUG_ALREADY_EXISTS`

### lưu ý type với Prisma

- `price` từ Prisma có thể là `Decimal`
- cần map sang `number` bằng `price.toNumber()`
- `createdAt`, `updatedAt` từ Prisma là `Date`
- map sang `string` bằng `.toISOString()`

Ví dụ mapper:

```ts
private toMenuItemDetailResult(menuItem: {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sku: string | null;
  price: { toNumber(): number };
  isActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): MenuItemDetailResult {
  return {
    id: menuItem.id,
    categoryId: menuItem.categoryId,
    name: menuItem.name,
    slug: menuItem.slug,
    description: menuItem.description,
    image: menuItem.image,
    sku: menuItem.sku,
    price: menuItem.price.toNumber(),
    isActive: menuItem.isActive,
    isAvailable: menuItem.isAvailable,
    sortOrder: menuItem.sortOrder,
    createdAt: menuItem.createdAt.toISOString(),
    updatedAt: menuItem.updatedAt.toISOString(),
  };
}
```

---

# 🗄️ Database (Prisma)

- mỗi service có schema riêng
- generate client riêng
- catalog dùng `CatalogPrismaService`
- iam dùng `IamPrismaService`

Ví dụ generator:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/catalog"
}
```

---

# 🖼️ Media Strategy

## Lưu trong DB

```ts
image: string;
```

hoặc lưu `key` nếu sau này muốn chuẩn hóa qua CDN / signed GET.

## Không lưu

- presigned URL
- file raw

---

# 🔥 Nguyên tắc kiến trúc

- Gateway = HTTP layer
- Service = business logic
- Contracts = communication layer
- Messaging = RMQ config + patterns
- Common = shared logic
- Database = Prisma module
- Config = namespace config theo service

---

# ✅ Mục tiêu hiện tại

- scalable microservice
- clean architecture
- gateway / service tách rõ
- error handling chuẩn hóa
- mở rộng category / menu-item / media dễ dàng
- tiếp tục phát triển ordering / payment / notification sau

# 📁 Logger Library

libs/logger/
src/
logger.module.ts
logger.service.ts
interceptors/
http-logging.interceptor.ts
rpc-logging.interceptor.ts
utils/
request-context.util.ts
index.ts

---

# 📊 Logging Strategy

## 🎯 Mục tiêu

- trace request end-to-end (Gateway → RMQ → Microservice)
- debug lỗi nhanh
- theo dõi performance
- chuẩn hóa format log toàn hệ thống

---

# 📁 Logger Library

```txt
libs/logger/
  src/
    logger.module.ts
    logger.service.ts
    interceptors/
      http-logging.interceptor.ts
      rpc-logging.interceptor.ts
    utils/
      request-context.util.ts
    index.ts
```

---

# 🧠 Nguyên tắc logging

## 1. Gateway

Log:

- HTTP request vào
- HTTP response ra
- RMQ command gửi đi
- error HTTP

---

## 2. Microservice

Log:

- message nhận từ RMQ
- business flow
- DB operation quan trọng
- error RPC

---

## 3. Correlation ID

- dùng `requestId` để trace xuyên suốt
- Gateway generate nếu chưa có
- truyền qua RMQ trong payload

---

# 🆔 Request ID

## Header

```txt
x-request-id
```

## Rule

- nếu client gửi → dùng lại
- nếu không có → generate `uuid`

---

# 🔧 Logger Service

## `AppLoggerService`

```ts
logWithContext(message, context, meta?)
warnWithContext(message, context, meta?)
errorWithContext(message, trace, context, meta?)
```

---

# 🌐 HTTP Logging (Gateway)

## `HttpLoggingInterceptor`

### Log request

```json
{
  "requestId": "...",
  "method": "POST",
  "url": "/api/v1/category",
  "params": {},
  "query": {},
  "body": {}
}
```

### Log response

```json
{
  "requestId": "...",
  "statusCode": 201,
  "durationMs": 35
}
```

### Log error

```json
{
  "requestId": "...",
  "statusCode": 400,
  "errorMessage": "Slug đã tồn tại"
}
```

---

# 📡 RPC Logging (Microservice)

## `RpcLoggingInterceptor`

### Log incoming

```json
{
  "requestId": "...",
  "pattern": "catalog.category.create",
  "payload": {}
}
```

### Log processed

```json
{
  "requestId": "...",
  "durationMs": 12
}
```

### Log error

```json
{
  "requestId": "...",
  "errorMessage": "..."
}
```

---

# 🔁 Gateway → RMQ Logging

## Rule

Trước khi `.send()` phải log:

```ts
this.logger.logWithContext(
  'Sending RMQ command',
  'CategoryCatalogGatewayService',
  {
    requestId,
    pattern: CATALOG_PATTERNS.CREATE_CATEGORY,
    payload: command,
  },
);
```

---

# 📥 Microservice Controller Logging

## Rule

Log ngay khi nhận message:

```ts
this.logger.logWithContext('Received RMQ command', 'CategoryController', {
  requestId: command.requestId,
  pattern: CATALOG_PATTERNS.CREATE_CATEGORY,
  payload: command,
});
```

---

# ⚙️ Service Logging

## Rule

### Start

```ts
this.logger.logWithContext('Start create category', 'CategoryService', {
  requestId,
});
```

### Warning

```ts
this.logger.warnWithContext('Category slug already exists', 'CategoryService', {
  requestId,
});
```

### Success

```ts
this.logger.logWithContext('Category created successfully', 'CategoryService', {
  requestId,
  durationMs,
});
```

### Error

```ts
this.logger.errorWithContext(
  'Create category failed',
  error.stack,
  'CategoryService',
  { requestId },
);
```

---

# 🚫 Không log

- password
- access token / refresh token
- secret key
- file binary
- dữ liệu quá lớn

---

# 🧪 Log level

## log

- flow bình thường

## warn

- dữ liệu bất thường
- duplicate
- retry

## error

- exception
- DB fail
- RMQ fail

---

# 🔄 Ví dụ flow log

```txt
[Gateway] Incoming HTTP request { requestId: 'a1' }
[Gateway] Sending RMQ command { requestId: 'a1' }
[Catalog] Received RMQ command { requestId: 'a1' }
[CategoryService] Start create category { requestId: 'a1' }
[CategoryService] Category created successfully { requestId: 'a1' }
[Gateway] HTTP request completed { requestId: 'a1' }
```

---

# 🧩 Integration

## Gateway

```ts
imports: [LoggerModule];
```

```ts
app.useGlobalInterceptors(
  new HttpLoggingInterceptor(logger),
  new ResponseInterceptor(),
);
```

---

## Microservice

```ts
imports: [LoggerModule];
```

```ts
app.useGlobalFilters(new GlobalRpcExceptionFilter());
```

---

# ✅ Kết quả

- trace full request lifecycle
- debug nhanh khi lỗi
- log thống nhất toàn hệ thống
- dễ tích hợp ELK / Loki / CloudWatch sau này

---

# 🆔 Request ID trong Contracts

## Mục tiêu

- trace xuyên suốt từ Gateway → RMQ → Microservice
- thống nhất correlation id toàn hệ thống
- hỗ trợ debug và logging production

---

# 📁 Cấu trúc thêm trong `libs/contracts`

```txt
libs/contracts/
  src/
    common/
      request-context.interface.ts
```

---

# 🧩 Request Context Interface

## `request-context.interface.ts`

```ts
export interface RequestContext {
  requestId: string;
}
```

---

# 📌 Rule mới cho Contracts

## Command / Query

- tất cả `Command`
- tất cả `Query`

đều phải extend `RequestContext`

## Result

- `Result` không bắt buộc có `requestId`

---

# ✅ Ví dụ chuẩn

## Create Category Command

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface CreateCategoryCommand extends RequestContext {
  name: string;
  slug: string;
  description?: string;
}
```

## Get Category Detail Query

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface GetCategoryDetailQuery extends RequestContext {
  id: string;
}
```

## List Categories Query

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface ListCategoriesQuery extends RequestContext {
  keyword?: string;
  page?: number;
  limit?: number;
}
```

## Create Menu Item Command

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface CreateMenuItemCommand extends RequestContext {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sku?: string;
  price: number;
  isActive?: boolean;
  isAvailable?: boolean;
  sortOrder?: number;
}
```

## Login Command

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface LoginCommand extends RequestContext {
  email: string;
  password: string;
}
```

## Register Command

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface RegisterCommand extends RequestContext {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
```

## Create Upload Url Command

```ts
import { RequestContext } from '@app/contracts/common/request-context.interface';

export interface CreateUploadUrlCommand extends RequestContext {
  fileName: string;
  fileType: string;
  folder?: string;
}
```

---

# 🌐 Gateway Rule

## Generate `requestId`

- lấy từ header `x-request-id` nếu có
- nếu không có thì generate mới

## Khi map `RequestDto -> Command / Query`

phải gắn thêm `requestId`

---

# 🧱 Ví dụ Gateway Service

## Create category

```ts
const requestId = getOrCreateRequestId(request.headers['x-request-id']);

const command: CreateCategoryCommand = {
  requestId,
  name: dto.name,
  slug: dto.slug,
  description: dto.description,
};
```

## Get category detail

```ts
const query: GetCategoryDetailQuery = {
  requestId,
  id,
};
```

## Create menu item

```ts
const command: CreateMenuItemCommand = {
  requestId,
  categoryId: dto.categoryId,
  name: dto.name,
  slug: dto.slug,
  description: dto.description,
  image: dto.image,
  sku: dto.sku,
  price: dto.price,
  isActive: dto.isActive,
  isAvailable: dto.isAvailable,
  sortOrder: dto.sortOrder,
};
```

---

# 📡 Microservice Rule

## Controller

Nhận trực tiếp `command/query` đã có `requestId`

```ts
@MessagePattern(CATALOG_PATTERNS.CREATE_CATEGORY)
create(
  @Payload() command: CreateCategoryCommand,
  @Ctx() context: RmqContext,
) {
  return handleRpcMessage(context, () => this.categoryService.create(command));
}
```

## Service

Dùng `command.requestId` hoặc `query.requestId` để log

```ts
this.logger.logWithContext('Start create category', 'CategoryService', {
  requestId: command.requestId,
});
```

---

# 🧠 Rule naming

## Field bắt buộc thống nhất

```ts
requestId: string;
```

## Không dùng tên khác

- `traceId`
- `correlationId`
- `reqId`

---

# 🔁 Quy ước áp dụng

## Áp dụng cho

- IAM commands / queries
- Catalog commands / queries
- Media commands / queries
- các service mở rộng sau:
  - ordering
  - dinein
  - payment
  - notification
  - review

---

# 🚫 Không áp dụng cho

- HTTP `RequestDto`
- HTTP `ResponseDto`
- `Result`

---

# 📤 Export

## `libs/contracts/src/index.ts`

```ts
export * from './common/request-context.interface';
```

---

# ✅ Kết quả

- mọi RMQ payload đều có `requestId`
- log trace đồng nhất giữa gateway và microservice
- dễ tích hợp distributed tracing về sau
- dễ debug theo từng request
